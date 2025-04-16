import { Router } from 'express';
import * as NotificationController from '../controllers/notification.controller';

const router = Router();

router.get('/', NotificationController.fetchUnread);
router.patch('/mark-read/:id', NotificationController.markAsRead);
router.post('/subscribe', NotificationController.subscribe);

export default router;
