import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const LATE_CUTOFF = process.env.LATE_ATTENDANCE_TIME || '09:00:00';

function parseQrData(qrData) {
  if (!qrData) {
    throw createError('QR data is required', 400);
  }

  if (typeof qrData === 'object') {
    return qrData;
  }

  try {
    return JSON.parse(qrData);
  } catch {
    // Backward compatibility: allow token-only QR content.
    return { token: String(qrData).trim() };
  }
}

function toTimeString(date) {
  return date.toTimeString().slice(0, 8);
}

function normalizeAttendanceRow(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    attendanceDate: row.attendance_date,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function scanAttendance({ reqUser, employeeId, qrData }) {
  if (!reqUser) {
    throw createError('Not authenticated', 401);
  }

  if (reqUser.role !== 'employee') {
    throw createError('Only employees can scan attendance', 403);
  }

  const parsedQr = parseQrData(qrData);
  const qrToken = parsedQr.token;

  if (!qrToken) {
    throw createError('QR token is missing', 400);
  }

  const scannedEmployeeId = String(parsedQr.employeeId || employeeId || '').trim();

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [dateRows] = await connection.query(
      'SELECT CURRENT_DATE() AS attendance_date'
    );
    const attendanceDate = dateRows[0].attendance_date;
    const attendanceTime = toTimeString(new Date());

    const [qrRows] = await connection.execute(
      `SELECT id, employee_id, qr_data, status, expires_at
       FROM qr_codes
       WHERE code = ?
       LIMIT 1
       FOR UPDATE`,
      [qrToken]
    );

    if (qrRows.length === 0) {
      throw createError('Invalid or unknown QR code', 400);
    }

    const qrRecord = qrRows[0];
    const storedPayload =
      typeof qrRecord.qr_data === 'string' ? JSON.parse(qrRecord.qr_data) : qrRecord.qr_data;

    if (qrRecord.status !== 'active') {
      throw createError('QR code is no longer active', 400);
    }

    if (new Date(qrRecord.expires_at).getTime() <= Date.now()) {
      await connection.execute("UPDATE qr_codes SET status = 'expired' WHERE id = ?", [
        qrRecord.id,
      ]);
      throw createError('QR code has expired', 400);
    }

    const effectiveEmployeeId = String(
      qrRecord.employee_id || storedPayload?.employeeId || scannedEmployeeId
    ).trim();

    if (!effectiveEmployeeId) {
      throw createError('Employee ID is missing in QR record', 400);
    }

    const [attendanceRows] = await connection.execute(
      `SELECT id, employee_id, attendance_date, check_in_time, check_out_time, status, created_at
       FROM attendance
       WHERE employee_id = ? AND attendance_date = ?
       LIMIT 1
       FOR UPDATE`,
      [effectiveEmployeeId, attendanceDate]
    );

    if (attendanceRows.length === 0) {
      const isLate = attendanceTime > LATE_CUTOFF;
      const status = isLate ? 'late' : 'present';

      const [insertResult] = await connection.execute(
        `INSERT INTO attendance (
          user_id,
          employee_id,
          date,
          attendance_date,
          check_in,
          check_in_time,
          check_out,
          check_out_time,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?)` ,
        [
          reqUser.id,
          effectiveEmployeeId,
          attendanceDate,
          attendanceDate,
          attendanceTime,
          attendanceTime,
          status,
        ]
      );

      await connection.commit();

      return {
        success: true,
        message: 'Check-In recorded successfully',
        type: 'checkin',
        attendanceStatus: 'check-in',
        isLate,
        attendance: normalizeAttendanceRow({
          id: insertResult.insertId,
          employee_id: effectiveEmployeeId,
          attendance_date: attendanceDate,
          check_in_time: attendanceTime,
          check_out_time: null,
          status,
          created_at: new Date(),
        }),
      };
    }

    const attendanceRecord = attendanceRows[0];

    if (attendanceRecord.check_out_time) {
      throw createError('Attendance already completed for today', 400);
    }

    await connection.execute(
      `UPDATE attendance
       SET check_out_time = ?, check_out = ?
       WHERE id = ?`,
      [attendanceTime, attendanceTime, attendanceRecord.id]
    );

    await connection.commit();

    return {
      success: true,
      message: 'Check-Out recorded successfully',
      type: 'checkout',
      attendanceStatus: 'check-out',
      attendance: normalizeAttendanceRow({
        ...attendanceRecord,
        check_out_time: attendanceTime,
      }),
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}