import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const toEmployeeCode = (userId) => `EMP-${String(userId).padStart(4, '0')}`;
const normalizeUsername = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

async function createUniqueUsername(connection, preferredUsername, fullName) {
  const base = normalizeUsername(preferredUsername) || normalizeUsername(String(fullName || '').split(/\s+/)[0] || 'employee');
  let candidate = base || 'employee';
  let counter = 0;

  while (true) {
    const [rows] = await connection.execute('SELECT id FROM users WHERE username = ? LIMIT 1', [candidate]);
    if (rows.length === 0) return candidate;
    counter += 1;
    candidate = `${base || 'employee'}${counter}`;
  }
}

/**
 * Get dashboard summary statistics
 * GET /api/admin/summary
 */
export const getDashboardSummary = async (req, res, next) => {
  try {
    // Total employees count
    const [employeeCount] = await pool.execute(
      "SELECT COUNT(*) as count FROM users WHERE role = 'employee'"
    );

    // Total users (including admin)
    const [totalUsers] = await pool.execute(
      'SELECT COUNT(*) as count FROM users'
    );

    // Present today
    const today = new Date().toISOString().split('T')[0];
    const [presentToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'present'",
      [today]
    );

    // Late today
    const [lateToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'late'",
      [today]
    );

    // Absent today (employees who haven't checked in at all)
    const [absentToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'absent'",
      [today]
    );

    // Half day today
    const [halfDayToday] = await pool.execute(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'half_day'",
      [today]
    );

    // Weekly trend (last 7 days)
    const [weeklyTrend] = await pool.execute(
      `SELECT 
        date,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as halfDay
      FROM attendance 
      WHERE date >= DATE_SUB(?, INTERVAL 6 DAY)
      GROUP BY date
      ORDER BY date ASC`,
      [today]
    );

    res.status(200).json({
      success: true,
      data: {
        totalEmployees: employeeCount[0].count,
        totalUsers: totalUsers[0].count,
        presentToday: presentToday[0].count,
        lateToday: lateToday[0].count,
        absentToday: absentToday[0].count,
        halfDayToday: halfDayToday[0].count,
        weeklyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance trends data for charts
 * GET /api/admin/attendance-trends
 */
export const getAttendanceTrends = async (req, res, next) => {
  try {
    const { range = '30' } = req.query;
    const days = parseInt(range, 10) || 30;

    // Daily attendance trend
    const [dailyTrends] = await pool.execute(
      `SELECT 
        date,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as halfDay,
        COUNT(*) as total
      FROM attendance 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY date
      ORDER BY date ASC`,
      [days]
    );

    // Monthly summary (last 6 months)
    const [monthlySummary] = await pool.execute(
      `SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as halfDay
      FROM attendance 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC`
    );

    // Department-wise attendance (mock data since we don't have user-department link yet)
    const departmentData = [
      { name: 'Engineering', present: 85, late: 10, absent: 5 },
      { name: 'Marketing', present: 90, late: 5, absent: 5 },
      { name: 'Sales', present: 80, late: 12, absent: 8 },
      { name: 'HR', present: 95, late: 3, absent: 2 },
      { name: 'Finance', present: 88, late: 7, absent: 5 },
      { name: 'Operations', present: 82, late: 10, absent: 8 },
    ];

    res.status(200).json({
      success: true,
      data: {
        dailyTrends,
        monthlySummary,
        departmentData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get employees list with attendance stats
 * GET /api/admin/employees
 */
export const getEmployees = async (req, res, next) => {
  try {
    const [employees] = await pool.execute(
      `SELECT 
        u.id,
        u.username,
        u.employee_id,
        u.name,
        u.email,
        u.department,
        u.role,
        u.account_status,
        u.created_at,
        COUNT(DISTINCT a.id) as totalAttendance,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as presentCount,
        SUM(CASE WHEN a.status = 'late' THEN 1 ELSE 0 END) as lateCount,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absentCount
      FROM users u
      LEFT JOIN attendance a ON u.id = a.user_id
      WHERE u.role = 'employee'
      GROUP BY u.id
      ORDER BY u.created_at DESC`
    );

    const normalized = employees.map((row) => ({
      id: row.id,
      username: row.username,
      employeeId: row.employee_id || `EMP-${String(row.id).padStart(4, '0')}`,
      fullName: row.name,
      email: row.email,
      department: row.department || 'Operations',
      role: row.role,
      accountStatus: row.account_status || 'Active',
      registrationDate: row.created_at,
      totalAttendance: row.totalAttendance,
      presentCount: row.presentCount,
      lateCount: row.lateCount,
      absentCount: row.absentCount,
    }));

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  const connection = await pool.getConnection();

  try {

    const {
      fullName,
      email,
      department,
      role = 'employee',
      username,
      password,
      autoGeneratePassword = true,
    } = req.body;

    if (!fullName || !email || !department) {
      throw createError('Full name, email and department are required', 400);
    }

    const validRoles = ['admin', 'employee'];
    const finalRole = validRoles.includes(role) ? role : 'employee';
    const [existingEmail] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existingEmail.length > 0) {
      throw createError('Email already registered', 409);
    }

    const generatedPassword = autoGeneratePassword ? crypto.randomBytes(6).toString('base64url') : String(password || '').trim();
    if (!generatedPassword || generatedPassword.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    const finalUsername = await createUniqueUsername(connection, username, fullName);
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO users (username, name, email, password, department, role, account_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [finalUsername, fullName, email, hashedPassword, department, finalRole]
    );

    const employeeId = toEmployeeCode(result.insertId);
    const qrToken = crypto.randomBytes(24).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const qrData = JSON.stringify({
      employeeId,
      username: finalUsername,
      name: fullName,
      email,
      department,
      role: 'employee',
      token: qrToken,
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    });

    await connection.execute(
            role: finalRole,
      [employeeId, qrToken, result.insertId]
    );

    await connection.execute(
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
      ) VALUES (?, ?, ?, ?, ?, 'employee', 'Check-In', ?, ?, 'active', ?, ?, ?)`,
      [employeeId, fullName, email, department, department, qrToken, qrData, now, expiresAt, req.user.id]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully',
      generatedPassword,
      employee: {
        id: result.insertId,
        employeeId,
        username: finalUsername,
        fullName,
        email,
        department,
        role: 'employee',
        accountStatus: 'Active',
        registrationDate: now.toISOString(),
        qrToken,
      },
      qrToken,
      qrData,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

/**
 * Get attendance records for admin table
 * GET /api/admin/attendance-records
 */
export const getAttendanceRecords = async (req, res, next) => {
  try {
    const { date, employeeId } = req.query;

    const where = [];
    const params = [];

    if (date) {
      where.push('a.attendance_date = ?');
      params.push(date);
    }

    if (employeeId && employeeId !== 'All') {
      where.push('a.employee_id = ?');
      params.push(employeeId);
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await pool.execute(
      `SELECT
        a.id,
        a.employee_id AS employeeId,
        u.name,
        COALESCE(NULLIF(u.role, ''), 'employee') AS role,
        a.attendance_date AS date,
        a.status,
        a.check_in_time AS checkIn,
        a.check_out_time AS checkOut
      FROM attendance a
      LEFT JOIN users u ON u.id = a.user_id
      ${whereClause}
      ORDER BY a.attendance_date DESC, a.id DESC
      LIMIT 500`,
      params
    );

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    next(error);
  }
};

