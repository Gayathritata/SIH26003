import { Router } from 'express';
import { createGameSession, getUserGameSessions, getGameContent } from '../controllers/gameController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Save game session (POST /api/game-sessions or POST /api/games/sessions)
router.post('/', authenticateToken, createGameSession);
router.post('/sessions', authenticateToken, createGameSession);

// Fetch user completed game sessions (GET /api/game-sessions/my-sessions or GET /api/games/my-sessions)
router.get('/my-sessions', authenticateToken, getUserGameSessions);
router.get('/sessions/my-sessions', authenticateToken, getUserGameSessions);
router.get('/', authenticateToken, getUserGameSessions);

// Fetch game content
router.get('/content', getGameContent);

export default router;
