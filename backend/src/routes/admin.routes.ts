import { Router } from 'express';
import * as AdminController from '../controllers/admin.controller';

const router = Router();

router.get('/users', AdminController.listUsers);
router.post('/user/:id/ban', AdminController.banUser);
router.get('/orders', AdminController.viewOrders);
router.get('/requests', AdminController.viewTicketRequests);
router.get('/disputes', AdminController.listDisputes);
router.get('/stats', AdminController.platformStats);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
