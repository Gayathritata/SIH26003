import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  getPatientAnalytics,
  getPatientSessions,
} from '../controllers/patientController';
import { verifyFirebaseToken, requireCaregiverPatientAccess } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyFirebaseToken);

router.get('/', getPatients);
router.get('/:id', requireCaregiverPatientAccess, getPatientById);
router.get('/:id/analytics', requireCaregiverPatientAccess, getPatientAnalytics);
router.get('/:id/sessions', requireCaregiverPatientAccess, getPatientSessions);

export default router;

