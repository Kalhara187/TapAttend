import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { getMonthlyReport, getSummaryReport } from '../controllers/reportController.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/monthly', getMonthlyReport);
router.get('/summary', getSummaryReport);

export default router;
