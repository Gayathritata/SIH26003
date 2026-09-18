import { Router } from 'express';
import { getAlerts, updateAlertStatus } from '../controllers/alertController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyFirebaseToken);

router.get('/', getAlerts);
router.patch('/:id', updateAlertStatus);

export default router;
