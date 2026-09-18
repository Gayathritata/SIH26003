import { Router } from 'express';
import { syncUser, registerUser, updateOrCreateProfile, getMyProfile } from '../controllers/authController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

// POST /api/auth/sync - Synchronize Firebase-authenticated user with MongoDB
router.post('/sync', verifyFirebaseToken, syncUser);

// Endpoint called after Firebase registration to sync profile to MongoDB
router.post('/register', verifyFirebaseToken, registerUser);

// Profile update route
router.post('/profile', verifyFirebaseToken, updateOrCreateProfile);

// GET /api/auth/me - Verifies token & returns MongoDB user profile + role
router.get('/me', verifyFirebaseToken, getMyProfile);

export default router;

