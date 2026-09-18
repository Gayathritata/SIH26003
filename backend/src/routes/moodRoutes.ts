import { Router } from 'express';
import { logMood, getMoodLogs } from '../controllers/moodController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyFirebaseToken);

router.post('/', logMood);
router.get('/', getMoodLogs);

export default router;
