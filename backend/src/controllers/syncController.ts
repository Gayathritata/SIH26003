import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import GameSession from '../models/GameSession';
import Reminder from '../models/Reminder';
import MoodLog from '../models/MoodLog';

export const syncOfflineData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { items } = req.body;
    const defaultPatientId = req.user?.firebaseUid;

    if (!Array.isArray(items) || items.length === 0) {
      res.json({ success: true, syncedCount: 0, message: 'No sync items received.' });
      return;
    }

    let syncedCount = 0;
    const results = [];

    for (const item of items) {
      const { entityType, payload, localId } = item;
      const patientId = payload.patientId || defaultPatientId;

      if (entityType === 'game_session') {
        // Idempotent duplicate check by patientId, createdAt timestamp / localId
        const existing = await GameSession.findOne({
          patientId,
          gameType: payload.gameType,
          score: payload.score,
          createdAt: payload.createdAt ? new Date(payload.createdAt) : { $gt: new Date(Date.now() - 60000) },
        });

        if (!existing) {
          const session = await GameSession.create({
            patientId,
            gameType: payload.gameType || 'memory',
            difficulty: payload.difficulty || 2,
            score: payload.score || 80,
            accuracy: payload.accuracy !== undefined ? payload.accuracy : 0.8,
            reactionTime: payload.reactionTime || 4.0,
            mistakes: payload.mistakes || 0,
            completionRate: payload.completionRate || 1.0,
            duration: payload.duration || 45,
            attempts: payload.attempts || 1,
            mood: payload.mood || 'good',
            aiRecommendedDifficulty: payload.aiRecommendedDifficulty || payload.difficulty || 2,
            aiConfidence: payload.aiConfidence || 0.85,
            aiReason: payload.aiReason || 'Synced from offline queue',
            createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
          });
          syncedCount++;
          results.push({ localId, status: 'synced', serverId: session._id });
        } else {
          results.push({ localId, status: 'duplicate_skipped', serverId: existing._id });
        }
      } else if (entityType === 'reminder_status') {
        if (payload.reminderId) {
          await Reminder.findByIdAndUpdate(payload.reminderId, { status: payload.status });
          syncedCount++;
          results.push({ localId, status: 'synced' });
        }
      } else if (entityType === 'mood_log') {
        const log = await MoodLog.create({
          patientId,
          mood: payload.mood,
          createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
        });
        syncedCount++;
        results.push({ localId, status: 'synced', serverId: log._id });
      }
    }

    res.json({
      success: true,
      syncedCount,
      message: `${syncedCount} records synchronized successfully.`,
      details: results,
    });
  } catch (error) {
    console.error('[SYNC CONTROLLER ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
