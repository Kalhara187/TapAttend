import crypto from 'crypto';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const ATTENDANCE_TYPES = ['Check-In', 'Check-Out'];

function normalizeQrRow(row) {
  const isExpired = new Date(row.expires_at).getTime() <= Date.now();
  const status = isExpired ? 'expired' : row.status;

  return {
    id: row.id,
    employeeId: row.employee_id,
    name: row.employee_name,
    email: row.email,
    department: row.department,
    location: row.location,
    role: row.role,
    attendanceType: row.attendance_type,
    token: row.code,
    generatedAt: row.generated_at,
    expiresAt: row.expires_at,
    status,
    createdAt: row.created_at,
    qrData: row.qr_data,
  };
}

export const generateQrCode = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    const {
      employeeId,
      fullName,
      email,
      department,
      location,
      role = 'Employee',
      attendanceType,
      expirationMinutes = 5,
    } = req.body;

    if (!employeeId || !fullName || !email || !department || !location || !attendanceType) {
      throw createError('All employee QR fields are required', 400);
    }

    if (!ATTENDANCE_TYPES.includes(attendanceType)) {
      throw createError('Attendance type must be Check-In or Check-Out', 400);
    }

    const minutes = Number.parseInt(expirationMinutes, 10);
    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 60) {
      throw createError('Expiration time must be between 1 and 60 minutes', 400);
    }

    const generatedAt = new Date();
    const expiresAt = new Date(generatedAt.getTime() + minutes * 60 * 1000);
    const token = crypto.randomBytes(24).toString('hex');
    const qrPayload = {
      employeeId,
      name: fullName,
      department,
      email,
      location,
      role,
      attendanceType,
      generatedAt: generatedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      token,
    };

    await connection.beginTransaction();

    await connection.execute(
      `UPDATE qr_codes
       SET status = 'revoked'
       WHERE employee_id = ? AND attendance_type = ? AND status = 'active'`,
      [employeeId, attendanceType]
    );

    const [result] = await connection.execute(
      `INSERT INTO qr_codes (
        employee_id,
        employee_name,
        email,
        department,
        location,
        role,
        attendance_type,
        code,
        qr_data,
        status,
        generated_at,
        expires_at,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)` ,
      [
        employeeId,
        fullName,
        email,
        department,
        location,
        role,
        attendanceType,
        token,
        JSON.stringify(qrPayload),
        generatedAt,
        expiresAt,
        req.user.id,
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'QR code generated successfully',
      qr: {
        id: result.insertId,
        ...qrPayload,
        status: 'active',
      },
      qrData: JSON.stringify(qrPayload),
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

export const getQrHistory = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        employee_id,
        employee_name,
        email,
        department,
        location,
        role,
        attendance_type,
        code,
        qr_data,
        status,
        generated_at,
        expires_at,
        created_by,
        created_at
      FROM qr_codes
      ORDER BY generated_at DESC, id DESC
      LIMIT 50`
    );

    const history = rows.map(normalizeQrRow);

    res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employee's active QR code for their profile
 * GET /api/qr/my-code
 */
export const getEmployeeQrCode = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get the user's employee_id
    const [users] = await pool.execute(
      'SELECT employee_id FROM users WHERE id = ?',
      [userId]
    );

    if (!users.length || !users[0].employee_id) {
      throw createError('Employee ID not found', 404);
    }

    const employeeId = users[0].employee_id;

    // Get the most recent active Check-In QR code for this employee
    const [qrRows] = await pool.execute(
      `SELECT
        id,
        employee_id,
        employee_name,
        email,
        department,
        location,
        role,
        attendance_type,
        code,
        qr_data,
        status,
        generated_at,
        expires_at,
        created_by,
        created_at
      FROM qr_codes
      WHERE employee_id = ? AND attendance_type = 'Check-In'
      ORDER BY generated_at DESC, id DESC
      LIMIT 1`,
      [employeeId]
    );

    if (!qrRows.length) {
      return res.status(200).json({
        success: true,
        qr: null,
        message: 'No QR code generated yet. Please contact your administrator.',
      });
    }

    const qr = normalizeQrRow(qrRows[0]);

    res.status(200).json({
      success: true,
      qr,
    });
  } catch (error) {
    next(error);
  }
};