import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/preferences', getPreferences);
router.put('/preferences', updatePreferences);

// Direct /profile/preferences compatibility
router.get('/', getPreferences);
router.put('/', updatePreferences);

export default router;
