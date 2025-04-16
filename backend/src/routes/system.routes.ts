import { Router } from 'express';
import * as SystemController from '../controllers/system.controller';

const router = Router();

router.get('/status', SystemController.status);
router.get('/version', SystemController.version);
router.get('/audit-logs', SystemController.userAuditLogs);

export default router;
