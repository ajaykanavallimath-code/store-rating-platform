/**
 * Standard Success Response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {any} data
 * @param {number} statusCode
 * @param {object|null} pagination
 */
export const successResponse = (res, message = 'Request successful', data = null, statusCode = 200, pagination = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (pagination) {
    response.pagination = pagination;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard Error Response
 * @param {import('express').Response} res
 * @param {string} message
 * @param {object|null} errors
 * @param {number} statusCode
 */
export const errorResponse = (res, message = 'Something went wrong', errors = null, statusCode = 500) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
