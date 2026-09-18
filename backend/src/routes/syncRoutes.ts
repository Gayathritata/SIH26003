import { Router } from 'express';
import { syncOfflineData } from '../controllers/syncController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', verifyFirebaseToken, syncOfflineData);

export default router;
