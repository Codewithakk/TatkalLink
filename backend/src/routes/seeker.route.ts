import express from 'express';
import {
    getProfile,
    updateProfile,
    createTicketRequest,
    getMyTicketRequests,
    cancelTicketRequest,
    getTicketRequestStatus
} from '../controllers/SeekerController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

router.post('/request', authMiddleware, createTicketRequest);
router.get('/requests', authMiddleware, getMyTicketRequests);
router.put('/request/cancel/:id', authMiddleware, cancelTicketRequest);
router.get('/request/status/:id', authMiddleware, getMyTicketRequests);

export default router;
