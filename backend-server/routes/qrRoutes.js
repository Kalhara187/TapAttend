import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { generateQrCode, getQrHistory, getEmployeeQrCode } from '../controllers/qrController.js';

const router = express.Router();

// Authenticated employee route - get their own QR code
router.get('/my-code', verifyToken, getEmployeeQrCode);

// Admin-only routes
router.use(verifyToken, requireAdmin);

router.post('/generate', generateQrCode);
router.get('/history', getQrHistory);

export default router;