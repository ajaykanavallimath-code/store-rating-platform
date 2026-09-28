import { errorResponse } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  // Handle JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload.', null, 400);
  }

  // Handle Database Connection Errors (MySQL not running or wrong credentials)
  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ETIMEDOUT') {
    return errorResponse(
      res,
      'Database connection failed: MySQL server is not running on localhost:3306. Please start MySQL and run `npm run db:init` & `npm run db:seed`.',
      { database: 'MySQL connection refused on host:port configured in backend/.env' },
      503
    );
  }

  // Handle Access Denied (Incorrect MySQL User/Password in .env)
  if (err.code === 'ER_ACCESS_DENIED_ERROR' || err.errno === 1045) {
    return errorResponse(
      res,
      'Database authentication failed: MySQL access denied. Please verify DB_USER and DB_PASSWORD in backend/.env.',
      { database: 'MySQL credentials mismatch' },
      503
    );
  }

  // Handle Missing Database
  if (err.code === 'ER_BAD_DB_ERROR' || err.errno === 1049) {
    return errorResponse(
      res,
      'Database not initialized: Database `store_rating_platform` does not exist. Please run `npm run db:init` and `npm run db:seed`.',
      { database: 'Database store_rating_platform not found' },
      503
    );
  }

  // Handle MySQL duplicate key error (ER_DUP_ENTRY / 1062)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    let message = 'A record with this information already exists.';
    if (err.message && err.message.includes('users.email')) {
      message = 'An account with this email address already exists.';
    } else if (err.message && err.message.includes('uk_user_store')) {
      message = 'You have already submitted a rating for this store.';
    }
    return errorResponse(res, message, null, 409);
  }

  // Handle MySQL foreign key errors
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return errorResponse(res, 'Referenced record does not exist.', null, 400);
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return errorResponse(res, 'CORS policy restriction.', null, 403);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred.';

  return errorResponse(res, message, null, statusCode);
};

export default errorHandler;
