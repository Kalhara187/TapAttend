import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import { listLeaves, createLeave } from '../controllers/leaveController.js';

const router = express.Router();

router.get('/', verifyToken, listLeaves);
router.post('/', verifyToken, createLeave);

export default router;
