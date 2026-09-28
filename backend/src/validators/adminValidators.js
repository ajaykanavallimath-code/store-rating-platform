import { body, query, param } from 'express-validator';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;

export const createUserValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 20, max: 60 }).withMessage('Name must be between 20 and 60 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ max: 400 }).withMessage('Address must not exceed 400 characters'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8, max: 16 }).withMessage('Password must be between 8 and 16 characters')
    .matches(PASSWORD_REGEX).withMessage('Password must be 8-16 characters with uppercase, lowercase, digit, and special character'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['ADMIN', 'USER', 'OWNER']).withMessage('Role must be ADMIN, USER, or OWNER')
];

export const createStoreValidator = [
  body('name')
    .trim()
    .notEmpty().withMessage('Store name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Store name must be between 3 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Store email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('address')
    .trim()
    .notEmpty().withMessage('Store address is required')
    .isLength({ max: 400 }).withMessage('Store address must not exceed 400 characters'),

  body('owner_id')
    .optional({ nullable: true, checkFalsy: true })
    .isInt({ min: 1 }).withMessage('Owner ID must be a valid positive integer')
];

export const userQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'email', 'address', 'role', 'created_at']).withMessage('Invalid sortBy field'),
  query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC'),
  query('role').optional().isIn(['ADMIN', 'USER', 'OWNER', '']).withMessage('Invalid role filter')
];

export const storeQueryValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('sortBy').optional().isIn(['name', 'email', 'address', 'avg_rating', 'rating_count', 'created_at']).withMessage('Invalid sortBy field'),
  query('order').optional().isIn(['ASC', 'DESC', 'asc', 'desc']).withMessage('Order must be ASC or DESC')
];
