import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getDashboardSummary,
  getAttendanceTrends,
  getEmployees,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken, requireAdmin);

router.get('/summary', getDashboardSummary);
router.get('/attendance-trends', getAttendanceTrends);
router.get('/employees', getEmployees);

export default router;

