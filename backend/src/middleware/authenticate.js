import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';
import { errorResponse } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check cookies (HttpOnly token)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Check Authorization Bearer header as standard alternative
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Authentication required. Please log in.', null, 401);
    }

    // Verify JWT
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Session expired. Please log in again.', null, 401);
      }
      return errorResponse(res, 'Invalid authentication token.', null, 401);
    }

    if (!decoded || !decoded.id) {
      return errorResponse(res, 'Invalid session token payload.', null, 401);
    }

    // Fetch user from DB to ensure they still exist and have the correct role
    const [rows] = await pool.query(
      'SELECT id, name, email, address, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Authenticated user account no longer exists.', null, 401);
    }

    // Attach user to request
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('[AuthMiddleware] Error:', error);
    return errorResponse(res, 'Authentication error.', null, 500);
  }
};

export default authenticate;
