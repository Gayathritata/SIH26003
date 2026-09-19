import { Router } from 'express';
import {
  getReminders,
  getReminderById,
  createReminder,
  updateReminder,
  deleteReminder,
  toggleReminderComplete,
  toggleReminderActive,
} from '../controllers/reminderController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all reminder endpoints with JWT authentication
router.use(authenticateToken);

router.get('/', getReminders);
router.post('/', createReminder);
router.get('/:id', getReminderById);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.patch('/:id/complete', toggleReminderComplete);
router.patch('/:id/toggle', toggleReminderActive);

export default router;

