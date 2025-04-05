import { Router } from 'express';
import { home } from '../controllers/homeController';

const router = Router();
router.get('/health', home);

export default router;