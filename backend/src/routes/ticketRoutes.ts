import express from 'express';
import {
  createTicketRequest,
  getUserRequests,
  getAllOpenRequests,
  acceptRequest,
  updateTicketStatus
} from '../controllers/ticketController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware(['seeker']), createTicketRequest);
router.get('/my-requests', authMiddleware, getUserRequests);
router.get('/open', authMiddleware, roleMiddleware(['provider']), getAllOpenRequests);
router.post('/accept/:id', authMiddleware, roleMiddleware(['provider']), acceptRequest);
router.patch('/status/:id', authMiddleware, updateTicketStatus);

export default router;