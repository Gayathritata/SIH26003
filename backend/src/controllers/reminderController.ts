import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Reminder from '../models/Reminder';
import CaregiverPatient from '../models/CaregiverPatient';

/**
 * Helper: Verify if user has permission to access this reminder
 */
const hasReminderAccess = async (req: AuthenticatedRequest, reminderUserId?: string): Promise<boolean> => {
  if (!req.user || !reminderUserId) return false;
  const currentUserId = req.user.mongoId || req.user.id || req.user.firebaseUid;

  // 1. Direct owner matches
  if (currentUserId === reminderUserId || req.user.firebaseUid === reminderUserId) return true;

  // 2. Admin has full access
  if (req.user.role === 'admin') return true;

  // 3. Caregiver assignment check
  if (req.user.role === 'caregiver') {
    const link = await CaregiverPatient.findOne({
      $or: [
        { caregiverId: currentUserId, patientId: reminderUserId },
        { caregiverId: req.user.firebaseUid, patientId: reminderUserId },
      ],
    });
    return !!link;
  }

  return false;
};


/**
 * GET /api/reminders
 * Fetches reminders for the authenticated user or caregiver's assigned patient
 */
export const getReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required. Verified JWT missing.' });
      return;
    }

    const currentUserId = req.user.mongoId || req.user.id || req.user.firebaseUid;
    const requestedPatientId = req.query.patientId as string;

    let targetUserId = currentUserId;

    if (requestedPatientId && (req.user.role === 'caregiver' || req.user.role === 'admin')) {
      const authorized = await hasReminderAccess(req, requestedPatientId);
      if (authorized) {
        targetUserId = requestedPatientId;
      }
    }

    const filter = {
      $or: [
        { userId: targetUserId },
        { patientId: targetUserId },
      ],
    };

    const reminders = await Reminder.find(filter).sort({ date: 1, time: 1, createdAt: -1 });

    res.json({
      success: true,
      count: reminders.length,
      reminders,
    });
  } catch (error) {
    console.error('[GET REMINDERS ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * GET /api/reminders/:id
 * Fetches a single reminder by ID
 */
export const getReminderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found.' });
      return;
    }

    const authorized = await hasReminderAccess(req, reminder.userId || reminder.patientId);
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Forbidden. You cannot access another user\'s reminders.' });
      return;
    }

    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * POST /api/reminders
 * Creates a new reminder
 */
export const createReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required. Verified JWT missing.' });
      return;
    }

    const currentUserId = req.user.mongoId || req.user.id || req.user.firebaseUid;
    const { title, description, type, date, time, repeat, patientId } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ success: false, error: 'Reminder title is required.' });
      return;
    }

    if (!time || typeof time !== 'string' || !time.trim()) {
      res.status(400).json({ success: false, error: 'Scheduled time is required.' });
      return;
    }

    // Determine target user (current user or authorized patient if caregiver)
    let targetUserId = currentUserId;
    let caregiverId: string | undefined = undefined;

    if (patientId && (req.user.role === 'caregiver' || req.user.role === 'admin')) {
      const authorized = await hasReminderAccess(req, patientId);
      if (authorized) {
        targetUserId = patientId;
        caregiverId = currentUserId;
      }
    }

    const validTypes = ['medicine', 'hydration', 'activity', 'appointment', 'general'];
    const validType = validTypes.includes(type) ? type : 'general';

    const validRepeats = ['none', 'daily', 'weekly'];
    const validRepeat = validRepeats.includes(repeat) ? repeat : 'none';

    const todayStr = new Date().toISOString().split('T')[0];
    const reminderDate = date ? date.toString().trim() : todayStr;

    const reminder = await Reminder.create({
      userId: targetUserId,
      patientId: targetUserId,
      caregiverId,
      title: title.trim(),
      description: (description || '').toString().trim(),
      type: validType,
      date: reminderDate,
      time: time.trim(),
      scheduledTime: `${reminderDate} ${time.trim()}`,
      repeat: validRepeat,
      isActive: true,
      completed: false,
      status: 'pending',
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    console.error('[CREATE REMINDER ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * PUT /api/reminders/:id
 * Updates an existing reminder
 */
export const updateReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found.' });
      return;
    }

    const authorized = await hasReminderAccess(req, reminder.userId || reminder.patientId);
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Forbidden. You cannot edit another user\'s reminders.' });
      return;
    }

    const { title, description, type, date, time, repeat, isActive, completed } = req.body;

    if (title !== undefined) reminder.title = title.trim();
    if (description !== undefined) reminder.description = description.trim();
    if (type !== undefined) reminder.type = type;
    if (date !== undefined) reminder.date = date;
    if (time !== undefined) reminder.time = time;
    if (repeat !== undefined) reminder.repeat = repeat;
    if (isActive !== undefined) reminder.isActive = Boolean(isActive);
    if (completed !== undefined) {
      reminder.completed = Boolean(completed);
      reminder.status = reminder.completed ? 'completed' : 'pending';
      if (reminder.completed) reminder.completedAt = new Date();
    }

    if (reminder.date && reminder.time) {
      reminder.scheduledTime = `${reminder.date} ${reminder.time}`;
    }

    await reminder.save();
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * DELETE /api/reminders/:id
 * Deletes a reminder
 */
export const deleteReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found.' });
      return;
    }

    const authorized = await hasReminderAccess(req, reminder.userId || reminder.patientId);
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Forbidden. You cannot delete another user\'s reminders.' });
      return;
    }

    await Reminder.findByIdAndDelete(id);
    res.json({ success: true, message: 'Reminder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * PATCH /api/reminders/:id/complete
 * Toggles or marks reminder completion
 */
export const toggleReminderComplete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found.' });
      return;
    }

    const authorized = await hasReminderAccess(req, reminder.userId || reminder.patientId);
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }

    const newCompleted = !reminder.completed;
    reminder.completed = newCompleted;
    reminder.status = newCompleted ? 'completed' : 'pending';
    if (newCompleted) reminder.completedAt = new Date();

    await reminder.save();
    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * PATCH /api/reminders/:id/toggle
 * Toggles active/inactive status
 */
export const toggleReminderActive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const { id } = req.params;
    const reminder = await Reminder.findById(id);

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found.' });
      return;
    }

    const authorized = await hasReminderAccess(req, reminder.userId || reminder.patientId);
    if (!authorized) {
      res.status(403).json({ success: false, error: 'Forbidden.' });
      return;
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
