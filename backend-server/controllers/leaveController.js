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

export const updateLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) throw createError('Not authenticated', 401);
    if (!status) throw createError('status is required', 400);

    // Verify the leave exists and is owned by the user or user is admin
    const [leaves] = await pool.execute(
      'SELECT id FROM leaves WHERE id = ? AND (user_id = ? OR ? = 1)',
      [id, userId, req.user.role === 'admin' ? 1 : 0]
    );

    if (leaves.length === 0) {
      throw createError('Leave request not found', 404);
    }

    await pool.execute(
      'UPDATE leaves SET status = ? WHERE id = ?',
      [status, id]
    );

    res.status(200).json({ success: true, message: 'Leave request updated' });
  } catch (error) {
    next(error);
  }
};

