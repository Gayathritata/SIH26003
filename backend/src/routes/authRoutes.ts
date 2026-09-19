import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getMyProfile, syncUser, updateOrCreateProfile } from '../controllers/authController';
import { getPreferences, updatePreferences } from '../controllers/preferencesController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Backwards compatibility endpoint
router.post('/sync', syncUser);
router.post('/profile', authenticateToken, updateOrCreateProfile);

// Protected auth profile & preferences endpoints
router.get('/me', authenticateToken, getMyProfile);
router.get('/preferences', authenticateToken, getPreferences);
router.put('/preferences', authenticateToken, updatePreferences);

export default router;
