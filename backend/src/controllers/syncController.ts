import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import GameSession from '../models/GameSession';
import Reminder from '../models/Reminder';
import MoodLog from '../models/MoodLog';

/**
 * POST /api/sync/game-sessions
 * Synchronizes offline completed game sessions with strict idempotency check & authenticated JWT identity
 */
export const syncGameSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Unauthenticated user context.' });
      return;
    }

    const authenticatedUserId = (req.user.mongoId || req.user.id).toString();
    const sessions = req.body.sessions || req.body.items || [];

    if (!Array.isArray(sessions) || sessions.length === 0) {
      res.json({ success: true, synced: 0, duplicates: 0, failed: 0, message: 'No pending sessions to sync.' });
      return;
    }

    let synced = 0;
    let duplicates = 0;
    let failed = 0;
    const details = [];

    for (const item of sessions) {
      try {
        const payload = item.payload || item;
        const clientSessionId = payload.clientSessionId || item.clientSessionId || item.localId;

        // Idempotent duplicate check by clientSessionId OR (userId + gameType + startedAt)
        let existing = null;
        if (clientSessionId) {
          existing = await GameSession.findOne({ clientSessionId });
        }

        if (!existing && payload.startedAt) {
          existing = await GameSession.findOne({
            userId: authenticatedUserId,
            gameType: payload.gameType || 'memory_match',
            score: payload.score || 0,
            startedAt: new Date(payload.startedAt),
          });
        }

        if (existing) {
          duplicates++;
          details.push({ clientSessionId, status: 'duplicate_skipped', serverId: existing._id });
        } else {
          const newSession = await GameSession.create({
            clientSessionId,
            userId: authenticatedUserId,
            patientId: req.user.firebaseUid || authenticatedUserId,
            gameType: payload.gameType || 'memory_match',
            difficulty: payload.difficulty || 1,
            totalPairs: payload.totalPairs || 3,
            attempts: payload.attempts || 1,
            correctMatches: payload.correctMatches || 0,
            incorrectAttempts: payload.incorrectAttempts || 0,
            accuracy: payload.accuracy !== undefined ? payload.accuracy : 100,
            completionTime: payload.completionTime || payload.duration || 30,
            completionRate: payload.completionRate || 100,
            score: payload.score || 0,
            startedAt: payload.startedAt ? new Date(payload.startedAt) : new Date(),
            completedAt: payload.completedAt ? new Date(payload.completedAt) : new Date(),
            reactionTime: payload.reactionTime || 0,
            mistakes: payload.mistakes || payload.incorrectAttempts || 0,
            duration: payload.completionTime || payload.duration || 30,
            mood: payload.mood || 'good',
            aiRecommendedDifficulty: payload.difficulty || 1,
            aiConfidence: 0.85,
            aiReason: payload.difficultySource === 'local_fallback' ? 'Local Fallback Rule' : 'Offline session synced',
            createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
          });

          synced++;
          details.push({ clientSessionId, status: 'synced', serverId: newSession._id });
        }
      } catch (err) {
        console.warn('[SYNC RECORD ERROR]', err);
        failed++;
      }
    }

    res.json({
      success: true,
      synced,
      duplicates,
      failed,
      message: `${synced} sessions synchronized successfully. ${duplicates} duplicates skipped.`,
      details,
    });
  } catch (error) {
    console.error('[SYNC GAME SESSIONS CONTROLLER ERROR]', error);
    res.status(500).json({ success: false, error: 'An error occurred during synchronization.' });
  }
};

/**
 * POST /api/sync (Legacy multi-entity sync endpoint)
 */
export const syncOfflineData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  return syncGameSessions(req, res);
};
