import { Router } from 'express';
import { getReminders, createReminder, updateReminderStatus } from '../controllers/reminderController';
import { verifyFirebaseToken } from '../middleware/authMiddleware';

const router = Router();

router.use(verifyFirebaseToken);

router.get('/', getReminders);
router.post('/', createReminder);
router.patch('/:id', updateReminderStatus);

export default router;
