import pool from '../config/db.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { successResponse, errorResponse } from '../utils/response.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000 // 1 day
};

/**
 * Public Signup for Normal Users only
 * POST /api/auth/signup
 */
export const signup = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedAddress = address.trim();

    // Check if email already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email address already exists.', {
        email: 'An account with this email address already exists.'
      }, 409);
    }

    const hashedPassword = await hashPassword(password);

    // Enforce USER role for all public registrations
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [trimmedName, normalizedEmail, hashedPassword, trimmedAddress, 'USER']
    );

    const user = {
      id: result.insertId,
      name: trimmedName,
      email: normalizedEmail,
      address: trimmedAddress,
      role: 'USER'
    };

    const token = signToken({ id: user.id, role: user.role });

    res.cookie('token', token, COOKIE_OPTIONS);

    return successResponse(res, 'Registration successful. Welcome to Store Rating Platform!', {
      user,
      token
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Shared Login for all roles (ADMIN, USER, OWNER)
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const [rows] = await pool.query(
      'SELECT id, name, email, password, address, role FROM users WHERE email = ?',
      [normalizedEmail]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    const userRecord = rows[0];
    const isPasswordValid = await comparePassword(password, userRecord.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password.', null, 401);
    }

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      address: userRecord.address,
      role: userRecord.role
    };

    const token = signToken({ id: user.id, role: user.role });

    res.cookie('token', token, COOKIE_OPTIONS);

    return successResponse(res, 'Login successful.', {
      user,
      token
    }, 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return successResponse(res, 'User authenticated.', {
    user: req.user
  });
};

/**
 * Logout user by clearing auth cookie
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });

  return successResponse(res, 'Logged out successfully.');
};

/**
 * Change authenticated user's password
 * PUT /api/auth/password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Fetch user's current hashed password
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return errorResponse(res, 'User not found.', null, 404);
    }

    const isMatch = await comparePassword(currentPassword, rows[0].password);
    if (!isMatch) {
      return errorResponse(res, 'Current password is incorrect.', {
        currentPassword: 'The current password you entered is incorrect.'
      }, 400);
    }

    const hashedNewPassword = await hashPassword(newPassword);

    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    // Clear authentication cookie to require re-authentication for security
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return successResponse(res, 'Password changed successfully. Please log in with your new password.');
  } catch (error) {
    next(error);
  }
};
