import { Router } from 'express';
import { syncGameSessions, syncOfflineData } from '../controllers/syncController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/game-sessions', syncGameSessions);
router.post('/sessions', syncGameSessions);
router.post('/', syncOfflineData);

export default router;
