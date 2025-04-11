import express from 'express';
import {
    addReview,
    getUserReviews,
    getMyReviews,
    deleteReview,
    getAverageRating,
    respondToReview
} from '../controllers/reviewController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', authMiddleware, addReview);
router.get('/user', getUserReviews);
router.get('/me', authMiddleware, getMyReviews);
router.delete('/:reviewId', authMiddleware, deleteReview);
router.get('/average', getAverageRating);
router.put('/respond/:reviewId', authMiddleware, respondToReview);

export default router;
