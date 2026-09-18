import { Router } from 'express';
import { createGameSession, getGameContent } from '../controllers/gameController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/sessions', verifyFirebaseToken, createGameSession);
router.get('/content', getGameContent);

export default router;
