import { scanAttendance } from '../services/attendanceService.js';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

export const scanAttendanceController = async (req, res, next) => {
  try {
    const result = await scanAttendance({
      reqUser: req.user,
      employeeId: req.body.employeeId,
      qrData: req.body.qrData,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createError('Not authenticated', 401);

    const [rows] = await pool.execute(
      `SELECT id, employee_id, attendance_date, check_in_time, check_out_time, status, created_at
       FROM attendance
       WHERE user_id = ?
       ORDER BY attendance_date DESC
       LIMIT 200`,
      [userId]
    );

    res.status(200).json({ success: true, history: rows });
  } catch (error) {
    next(error);
  }
};