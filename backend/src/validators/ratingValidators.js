import { body, param } from 'express-validator';

export const createRatingValidator = [
  body('storeId')
    .notEmpty().withMessage('Store ID is required')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
    .custom((value) => {
      // Reject non-integer numbers (e.g., 4.5)
      if (typeof value === 'number' && !Number.isInteger(value)) {
        throw new Error('Rating must be a whole integer between 1 and 5');
      }
      return true;
    })
];

export const updateRatingValidator = [
  param('storeId')
    .notEmpty().withMessage('Store ID is required')
    .isInt({ min: 1 }).withMessage('Store ID must be a positive integer'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5')
    .custom((value) => {
      if (typeof value === 'number' && !Number.isInteger(value)) {
        throw new Error('Rating must be a whole integer between 1 and 5');
      }
      return true;
    })
];
