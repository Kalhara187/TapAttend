import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

export const getMonthlyReport = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(attendance_date, '%Y-%m') AS month,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) AS late,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent,
        SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) AS halfDay
      FROM attendance
      WHERE attendance_date IS NOT NULL
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    const [rows] = await pool.execute(query);
    
    res.status(200).json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    next(error);
  }
};

export const getSummaryReport = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        CONCAT('Attendance Rate') AS label,
        CONCAT(ROUND((SUM(CASE WHEN status IN ('present', 'late', 'half_day') THEN 1 ELSE 0 END) / COUNT(*) * 100), 1), '%') AS value
      FROM attendance
      WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      UNION ALL
      SELECT 'Average Late Arrivals', CONCAT(ROUND(AVG(late_count), 0), '/day')
      FROM (
        SELECT DATE(attendance_date) AS date, COUNT(*) AS late_count
        FROM attendance
        WHERE status = 'late' AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY DATE(attendance_date)
      ) daily_late
      UNION ALL
      SELECT 'Approved Leaves', COUNT(*)
      FROM leaves
      WHERE status = 'approved'
      UNION ALL
      SELECT 'Total Employees', COUNT(*)
      FROM users
      WHERE role = 'employee'
    `;

    const [rows] = await pool.execute(query);
    
    res.status(200).json({
      success: true,
      data: rows || [],
    });
  } catch (error) {
    next(error);
  }
};
