import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { scanAttendanceController } from '../controllers/attendanceController.js';

const router = express.Router();

router.post('/scan', verifyToken, scanAttendanceController);

export default router;