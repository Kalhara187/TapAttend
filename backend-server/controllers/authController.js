import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { createError } from '../middleware/errorHandler.js';

const JWT_SECRET = process.env.JWT_SECRET || 'smartattend-dev-secret';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const toEmployeeCode = (userId) => `EMP-${String(userId).padStart(4, '0')}`;

const normalizeUsername = (value) => String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

const buildUsernameBase = (name) =>
  normalizeUsername(String(name || '').trim().split(/\s+/)[0] || 'employee');

async function createUniqueUsername(connection, preferredUsername, fullName) {
  const base = normalizeUsername(preferredUsername) || buildUsernameBase(fullName);
  let candidate = base || 'employee';
  let counter = 0;

  while (true) {
    const [rows] = await connection.execute(
      'SELECT id FROM users WHERE username = ? LIMIT 1',
      [candidate]
    );

    if (rows.length === 0) {
      return candidate;
    }

    counter += 1;
    candidate = `${base || 'employee'}${counter}`;
  }
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, username } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw createError('Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      throw createError('Password must be at least 6 characters', 400);
    }

    const validRoles = ['admin', 'employee'];
    const userRole = validRoles.includes(role) ? role : 'employee';
    const normalizedDepartment = String(department || 'Operations').trim() || 'Operations';

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw createError('Email already registered', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const finalUsername = await createUniqueUsername(connection, username, name);

      // Insert user
      const [result] = await connection.execute(
        'INSERT INTO users (username, name, email, password, role, department, account_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [finalUsername, name, email, hashedPassword, userRole, normalizedDepartment, 'Active']
      );

      const employeeId = userRole === 'employee' ? toEmployeeCode(result.insertId) : null;
      const qrToken = userRole === 'employee' ? crypto.randomBytes(24).toString('hex') : null;

      if (employeeId) {
        await connection.execute('UPDATE users SET employee_id = ?, qr_token = ? WHERE id = ?', [employeeId, qrToken, result.insertId]);
        await connection.execute(
          `INSERT INTO qr_codes (
            employee_id,
            employee_name,
            email,
            department,
            location,
            role,
            attendance_type,
            code,
            qr_data,
            status,
            generated_at,
            expires_at,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, 'Check-In', ?, ?, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), ?)` ,
          [
            employeeId,
            name,
            email,
            normalizedDepartment,
            normalizedDepartment,
            userRole,
            qrToken,
            JSON.stringify({
              employeeId,
              username: finalUsername,
              name,
              email,
              department: normalizedDepartment,
              role: userRole,
              token: qrToken,
              generatedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }),
            result.insertId,
          ]
        );
      }

      await connection.commit();

      // Generate JWT
      const token = generateToken({
        id: result.insertId,
        email,
        role: userRole,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        generatedPassword: password,
        qrToken,
        qrData: userRole === 'employee' ? JSON.stringify({ employeeId, username: finalUsername, name, email, department: normalizedDepartment, role: userRole, token: qrToken }) : null,
        user: {
          id: result.insertId,
          username: finalUsername,
          employeeId,
          name,
          email,
          department: normalizedDepartment,
          role: userRole,
          accountStatus: 'Active',
        },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const identifier = String(email || username || '').trim();

    // Validation
    if (!identifier || !password) {
      throw createError('Email and password are required', 400);
    }

    // Find user by email
    const [users] = await pool.execute(
      'SELECT id, employee_id, username, name, email, password, role, department, account_status, created_at, qr_token FROM users WHERE email = ? OR username = ? LIMIT 1',
      [identifier, identifier]
    );

    if (users.length === 0) {
      throw createError('Invalid email or password', 401);
    }

    const user = users[0];

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw createError('Invalid email or password', 401);
    }

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        employeeId: user.employee_id,
        name: user.name,
        email: user.email,
        department: user.department,
        role: user.role,
        accountStatus: user.account_status,
        createdAt: user.created_at,
        qrToken: user.qr_token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const [users] = await pool.execute(
      'SELECT id, employee_id, username, name, email, department, role, account_status, created_at, qr_token FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw createError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createError('Not authenticated', 401);
    }

    const { name, email, department } = req.body;

    if (!name || !email || !department) {
      throw createError('Name, email and department are required', 400);
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
      [email, userId]
    );

    if (existingUsers.length > 0) {
      throw createError('Email already in use by another account', 409);
    }

    await pool.execute(
      'UPDATE users SET name = ?, email = ?, department = ? WHERE id = ?',
      [name, email, department, userId]
    );

    const [users] = await pool.execute(
      'SELECT id, employee_id, username, name, email, department, role, account_status, created_at, qr_token FROM users WHERE id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: users[0],
    });
  } catch (error) {
    next(error);
  }
};

