import { Router } from 'express';
import { getDashboardOverview } from '../controllers/dashboardController';
import { verifyFirebaseToken, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/overview', verifyFirebaseToken, requireRole(['caregiver', 'admin']), getDashboardOverview);

export default router;
