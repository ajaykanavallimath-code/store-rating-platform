import { errorResponse } from '../utils/response.js';

/**
 * Role-based authorization middleware
 * @param  {...string} allowedRoles Roles allowed to access the route ('ADMIN', 'USER', 'OWNER')
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}`,
        null,
        403
      );
    }

    next();
  };
};

export default authorize;
