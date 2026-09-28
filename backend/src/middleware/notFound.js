import { errorResponse } from '../utils/response.js';

export const notFound = (req, res) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, null, 404);
};

export default notFound;
