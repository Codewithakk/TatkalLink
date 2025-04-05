import express from 'express';
import { submitRating, getProviderRatings } from '../controllers/ratingController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/submit', authMiddleware, submitRating);
router.get('/provider/:id', getProviderRatings);

export default router;
