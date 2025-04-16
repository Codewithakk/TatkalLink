import { Router } from 'express';
import * as OrderController from '../controllers/order.controller';

const router = Router();

// Fetch specific order detail
router.get('/:id', OrderController.getOrderById);

// Mark order as completed
router.post('/confirm/:id', OrderController.confirmOrder);

// Open dispute for an order
router.post('/dispute/:id', OrderController.disputeOrder);

// Upload ticket screenshot, PDF, receipt
router.post('/attachment/:id', OrderController.uploadAttachment);

// List all user's orders (seekers or providers)
router.get('/list', OrderController.listOrders);

export default router;
