import { query, param } from 'express-validator';

export const listStoresValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'address', 'avg_rating', 'rating_count', 'created_at']).withMessage('Invalid sortBy field'),
  query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC')
];

export const storeIdParamValidator = [
  param('id').notEmpty().isInt({ min: 1 }).withMessage('Valid store ID is required')
];
