import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';
import { generateQrCode, getQrHistory } from '../controllers/qrController.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.post('/generate', generateQrCode);
router.get('/history', getQrHistory);

export default router;