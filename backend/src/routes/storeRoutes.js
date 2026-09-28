import express from 'express';
import { getStores, getStoreById } from '../controllers/storeController.js';
import { optionalAuthenticate } from '../middleware/optionalAuthenticate.js';
import { validate } from '../middleware/validate.js';
import { listStoresValidator, storeIdParamValidator } from '../validators/storeValidators.js';

const router = express.Router();

// Public / User Store Browsing
router.get('/', optionalAuthenticate, validate(listStoresValidator), getStores);
router.get('/:id', optionalAuthenticate, validate(storeIdParamValidator), getStoreById);

export default router;
