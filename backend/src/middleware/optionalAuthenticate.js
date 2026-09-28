import { verifyToken } from '../utils/jwt.js';
import pool from '../config/db.js';

/**
 * Optional authentication: if token is present, resolves req.user.
 * If not, proceeds without error.
 */
export const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        const [rows] = await pool.query(
          'SELECT id, name, email, address, role FROM users WHERE id = ?',
          [decoded.id]
        );
        if (rows.length > 0) {
          req.user = rows[0];
        }
      }
    } catch {
      // If token invalid/expired in optional mode, simply proceed as guest
    }

    next();
  } catch {
    next();
  }
};

export default optionalAuthenticate;
