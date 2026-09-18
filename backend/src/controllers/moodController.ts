import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import MoodLog from '../models/MoodLog';

export const logMood = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { patientId, mood } = req.body;
    const targetId = patientId || req.user?.firebaseUid;

    if (!mood) {
      res.status(400).json({ success: false, error: 'Mood selection is required.' });
      return;
    }

    const log = await MoodLog.create({
      patientId: targetId,
      mood,
    });

    res.status(201).json({ success: true, moodLog: log });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getMoodLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const patientId = (req.query.patientId as string) || req.user?.firebaseUid;
    const logs = await MoodLog.find({ patientId }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, count: logs.length, moodLogs: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
