import { Router } from 'express';
import { getCaregiverDashboard, getCaregiverGameHistory, getCaregiverPatientsList, getCaregiverProfile } from '../controllers/caregiverController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Secure Caregiver Dashboard Endpoints (JWT Authenticated + Role Protected)
router.get('/dashboard', authenticateToken, getCaregiverDashboard);
router.get('/performance-summary', authenticateToken, getCaregiverDashboard);
router.get('/game-history', authenticateToken, getCaregiverGameHistory);
router.get('/patients-list', authenticateToken, getCaregiverPatientsList);
router.get('/profile', authenticateToken, getCaregiverProfile);

export default router;
