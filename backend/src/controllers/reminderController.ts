import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Reminder from '../models/Reminder';

export const getReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = (req.query.patientId as string) || req.user?.mongoId || req.user?.id || req.user?.firebaseUid || 'demo_patient_uid';
    const reminders = await Reminder.find({ patientId }).sort({ scheduledTime: 1 });
    res.json({ success: true, count: reminders.length, reminders });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const createReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, type, title, description, scheduledTime } = req.body;
    const targetId = patientId || req.user?.mongoId || req.user?.id || req.user?.firebaseUid || 'demo_patient_uid';

    const reminder = await Reminder.create({
      patientId: targetId,
      type: type || 'medicine',
      title,
      description: description || '',
      scheduledTime,
      status: 'pending',
    });

    res.status(201).json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const updateReminderStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const reminder = await Reminder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!reminder) {
      res.status(404).json({ success: false, error: 'Reminder not found' });
      return;
    }

    res.json({ success: true, reminder });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
