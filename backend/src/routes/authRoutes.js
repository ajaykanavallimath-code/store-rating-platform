import express from 'express';
import { signup, login, getMe, logout, changePassword } from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { signupValidator, loginValidator, passwordChangeValidator } from '../validators/authValidators.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/signup', authRateLimiter, validate(signupValidator), signup);
router.post('/login', authRateLimiter, validate(loginValidator), login);
router.post('/logout', logout);

// Authenticated Endpoints
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, validate(passwordChangeValidator), changePassword);

export default router;
