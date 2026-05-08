import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

export const listLeaves = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createError('Not authenticated', 401);

    const [rows] = await pool.execute(
      `SELECT id, user_id, start_date, end_date, reason, status, created_at
       FROM leaves
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 200`,
      [userId]
    );

    res.status(200).json({ success: true, leaves: rows });
  } catch (error) {
    next(error);
  }
};

export const createLeave = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw createError('Not authenticated', 401);

    const { startDate, endDate, reason, type } = req.body;

    if (!startDate || !endDate || !reason) {
      throw createError('startDate, endDate and reason are required', 400);
    }

    const [result] = await pool.execute(
      `INSERT INTO leaves (user_id, start_date, end_date, reason, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, startDate, endDate, reason]
    );

    res.status(201).json({ success: true, message: 'Leave request submitted', id: result.insertId });
  } catch (error) {
    next(error);
  }
};
