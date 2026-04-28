import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

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
        u.name,
        u.email,
        u.role,
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

    res.status(200).json({
      success: true,
      data: employees,
    });
  } catch (error) {
    next(error);
  }
};

