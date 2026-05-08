import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { scanAttendanceController, getAttendanceHistory } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/scan', verifyToken, scanAttendanceController);
router.get('/history', verifyToken, getAttendanceHistory);

export default router;