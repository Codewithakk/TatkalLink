import { Router } from 'express';
import * as PaymentController from '../controllers/payment.controller';

const router = Router();

router.post('/initiate', PaymentController.initiate);
router.post('/confirm', PaymentController.confirm);
router.get('/history', PaymentController.history);
router.get('/payouts', PaymentController.payouts);
router.post('/payout/request', PaymentController.requestPayout);

export default router;
