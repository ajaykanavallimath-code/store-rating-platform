import express from 'express';
import { getOwnerStores, getOwnerDashboard } from '../controllers/ownerController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

// Only authenticated users with role OWNER can access owner endpoints
router.use(authenticate, authorize('OWNER'));

router.get('/stores', getOwnerStores);
router.get('/dashboard', getOwnerDashboard);

export default router;
