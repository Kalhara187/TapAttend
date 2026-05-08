import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getDashboardSummary,
  getAttendanceTrends,
  getEmployees,
  getAttendanceRecords,
  createEmployee,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin);

router.get('/summary', getDashboardSummary);
router.get('/attendance-trends', getAttendanceTrends);
router.get('/employees', getEmployees);
router.get('/attendance-records', getAttendanceRecords);
router.post('/employees', createEmployee);

export default router;

