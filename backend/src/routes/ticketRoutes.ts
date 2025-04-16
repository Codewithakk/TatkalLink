import express from 'express';
import {
  createTicketRequest,
  getUserRequests,
  getAllOpenRequests,
  acceptRequest,
  updateTicketStatus,
  getAllRequests,
  getAllCompletedRequests,
  getAllStatistics,
  getAllEarnings
} from '../controllers/ticketController';
import { authMiddleware, roleMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/create', authMiddleware, roleMiddleware(['seeker']), createTicketRequest);
router.get('/my-requests', authMiddleware, getUserRequests);
router.get('/request/all', authMiddleware, getAllRequests);
router.get('/provider/orders', authMiddleware, roleMiddleware(['provider']), getAllCompletedRequests);
router.get('/provider/statistics', authMiddleware, getAllStatistics);
router.get('/provider/earnings', authMiddleware, roleMiddleware(['provider']), getAllEarnings);


router.get('/open', authMiddleware, roleMiddleware(['provider']), getAllOpenRequests);
router.post('/accept/:id', authMiddleware, roleMiddleware(['provider']), acceptRequest);
router.patch('/status/:id', authMiddleware, roleMiddleware(['seeker']), updateTicketStatus);

export default router;