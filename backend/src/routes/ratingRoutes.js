import express from 'express';
import { createRating, updateRating, getMyRatings } from '../controllers/ratingController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { createRatingValidator, updateRatingValidator } from '../validators/ratingValidators.js';

const router = express.Router();

// Only authenticated users with role USER can submit, modify, or view their ratings
router.use(authenticate, authorize('USER'));

router.get('/mine', getMyRatings);
router.post('/', validate(createRatingValidator), createRating);
router.put('/:storeId', validate(updateRatingValidator), updateRating);

export default router;
