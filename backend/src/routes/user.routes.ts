import express from 'express';
import { getUserProfile, updateUser, deleteUser, verifyId, getUserNotification } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/', authMiddleware, getUserProfile);
router.put('/', authMiddleware, updateUser);
router.delete('/', authMiddleware, deleteUser);
router.post('/user/verify', authMiddleware, verifyId)
router.get('/user/notification', authMiddleware, getUserNotification);

export default router;
