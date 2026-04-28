 import jwt from 'jsonwebtoken';
import { createError } from './errorHandler.js';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(createError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(createError('Token expired', 401));
    }
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw createError('Not authenticated', 401);
    }

    if (req.user.role !== 'admin') {
      throw createError('Access denied. Admin privileges required.', 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

