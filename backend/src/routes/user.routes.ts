import express from 'express';
import { getUserProfile, updateUser, deleteUser } from '../controllers/user.controller';
import  {authMiddleware}  from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/me', authMiddleware, getUserProfile);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

export default router;
