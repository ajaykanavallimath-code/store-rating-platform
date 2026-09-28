import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors into field -> message map
    const errorMap = {};
    for (const err of errors.array()) {
      if (!errorMap[err.path]) {
        errorMap[err.path] = err.msg;
      }
    }

    return errorResponse(res, 'Validation failed', errorMap, 400);
  };
};

export default validate;
