import { Router } from 'express';
import { registerUser, loginUser, logoutUser, getMyProfile, syncUser, updateOrCreateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public auth endpoints
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Backwards compatibility endpoint
router.post('/sync', syncUser);
router.post('/profile', authenticateToken, updateOrCreateProfile);

// Protected auth profile endpoint
router.get('/me', authenticateToken, getMyProfile);

export default router;
