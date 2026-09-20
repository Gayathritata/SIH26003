import { Router } from 'express';
import {
  getPatients,
  getPatientById,
  getPatientAnalytics,
  getPatientSessions,
  getAvailableCaregivers,
  selectCaregiver,
  getPatientMyProfile,
  getMotivationalQuote,
} from '../controllers/patientController';
import { verifyFirebaseToken, requireCaregiverPatientAccess } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyFirebaseToken);

router.get('/available-caregivers', getAvailableCaregivers);
router.post('/select-caregiver', selectCaregiver);
router.get('/my-profile', getPatientMyProfile);
router.get('/motivational-quote', getMotivationalQuote);

router.get('/', getPatients);
router.get('/:id', requireCaregiverPatientAccess, getPatientById);
router.get('/:id/analytics', requireCaregiverPatientAccess, getPatientAnalytics);
router.get('/:id/sessions', requireCaregiverPatientAccess, getPatientSessions);

export default router;

