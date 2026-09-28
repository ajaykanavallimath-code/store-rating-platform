import express from 'express';
import { 
  getDashboardStats, 
  getUsers, 
  getUserById, 
  createUser, 
  getStores, 
  createStore, 
  getStoreById 
} from '../controllers/adminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { 
  createUserValidator, 
  createStoreValidator, 
  userQueryValidator, 
  storeQueryValidator 
} from '../validators/adminValidators.js';

const router = express.Router();

// Admin-only protection for all routes in this router
router.use(authenticate, authorize('ADMIN'));

// Dashboard Stats
router.get('/dashboard', getDashboardStats);

// User Management
router.get('/users', validate(userQueryValidator), getUsers);
router.post('/users', validate(createUserValidator), createUser);
router.get('/users/:id', getUserById);

// Store Management
router.get('/stores', validate(storeQueryValidator), getStores);
router.post('/stores', validate(createStoreValidator), createStore);
router.get('/stores/:id', getStoreById);

export default router;
