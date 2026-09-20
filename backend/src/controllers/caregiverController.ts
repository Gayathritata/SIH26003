import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import GameSession from '../models/GameSession';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';

/**
 * Ensures request user is a Caregiver or Admin.
 */
const verifyCaregiverRole = (req: AuthenticatedRequest, res: Response): boolean => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required. Verified JWT token missing.' });
    return false;
  }

  const role = req.user.role;
  if (role !== 'caregiver' && role !== 'admin') {
    res.status(403).json({ success: false, error: 'Forbidden. Caregiver or Admin authorization required.' });
    return false;
  }
  return true;
};

/**
 * GET /api/caregiver/dashboard or /api/caregiver/performance-summary
 * Fetches real performance analytics and summary for caregiver view
 */
export const getCaregiverDashboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!verifyCaregiverRole(req, res)) return;

    const caregiverUid = req.user!.mongoId || req.user!.id || req.user!.firebaseUid;
    const requestedPatientId = req.query.patientId as string;

    let targetPatientId = requestedPatientId;

    if (!targetPatientId) {
      // Find assigned patient for caregiver
      const mapping = await CaregiverPatient.findOne({
        $or: [{ caregiverId: caregiverUid }, { caregiverId: req.user!.firebaseUid }],
      });
      if (mapping) {
        targetPatientId = mapping.patientId;
      }
    }

    // Query sessions for target patient or all patients if target is not specified
    const query = targetPatientId
      ? { $or: [{ userId: targetPatientId }, { patientId: targetPatientId }] }
      : {};

    const sessions = await GameSession.find(query).sort({ completedAt: -1, createdAt: -1 }).limit(50);

    // Empty state check
    if (sessions.length === 0) {
      res.json({
        success: true,
        isEmpty: true,
        summary: {
          totalGamesCompleted: 0,
          averageAccuracy: 0,
          averageScore: 0,
          averageCompletionTime: 0,
          averageCompletionRate: 0,
          performanceTrend: 'stable',
          latestAiRecommendedDifficulty: 'Medium',
        },
        gamesByType: {
          memory_match: { count: 0, avgAccuracy: 0, avgScore: 0 },
          pattern_recognition: { count: 0, avgAccuracy: 0, avgScore: 0 },
          daily_routine_recall: { count: 0, avgAccuracy: 0, avgScore: 0 },
          object_recognition: { count: 0, avgAccuracy: 0, avgScore: 0 },
        },
        gamesByDifficulty: { easy: 0, medium: 0, hard: 0 },
        mostRecentActivity: null,
        recentSessions: [],
      });
      return;
    }

    // Calculate real aggregated statistics from MongoDB Atlas session data
    const totalCount = sessions.length;
    const totalScore = sessions.reduce((sum, s) => sum + (s.score || 0), 0);
    const totalAccuracy = sessions.reduce((sum, s) => sum + (s.accuracy || 0), 0);
    const totalTime = sessions.reduce((sum, s) => sum + (s.completionTime || s.duration || 0), 0);
    const totalRate = sessions.reduce((sum, s) => sum + (s.completionRate || 100), 0);

    const averageScore = Math.round(totalScore / totalCount);
    const averageAccuracy = Number((totalAccuracy / totalCount).toFixed(1));
    const averageCompletionTime = Number((totalTime / totalCount).toFixed(1));
    const averageCompletionRate = Number((totalRate / totalCount).toFixed(1));

    // Performance trend calculation from recent vs older sessions
    let performanceTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (totalCount >= 2) {
      const recentHalf = sessions.slice(0, Math.ceil(totalCount / 2));
      const olderHalf = sessions.slice(Math.ceil(totalCount / 2));

      const recentAvgAcc = recentHalf.reduce((sum, s) => sum + s.accuracy, 0) / recentHalf.length;
      const olderAvgAcc = olderHalf.reduce((sum, s) => sum + s.accuracy, 0) / olderHalf.length;

      if (recentAvgAcc > olderAvgAcc + 5) performanceTrend = 'improving';
      else if (recentAvgAcc < olderAvgAcc - 5) performanceTrend = 'declining';
    }

    // Game-wise performance breakdown
    const gameTypeCounts: Record<string, { count: number; totalAcc: number; totalScore: number }> = {
      memory_match: { count: 0, totalAcc: 0, totalScore: 0 },
      pattern_recognition: { count: 0, totalAcc: 0, totalScore: 0 },
      daily_routine_recall: { count: 0, totalAcc: 0, totalScore: 0 },
      object_recognition: { count: 0, totalAcc: 0, totalScore: 0 },
    };

    sessions.forEach((s) => {
      let gtype = (s.gameType || 'memory_match').toLowerCase();
      if (gtype === 'memory') gtype = 'memory_match';
      if (gtype === 'pattern') gtype = 'pattern_recognition';
      if (gtype === 'routine') gtype = 'daily_routine_recall';
      if (gtype === 'object_rec') gtype = 'object_recognition';

      if (!gameTypeCounts[gtype]) {
        gameTypeCounts[gtype] = { count: 0, totalAcc: 0, totalScore: 0 };
      }
      gameTypeCounts[gtype].count += 1;
      gameTypeCounts[gtype].totalAcc += s.accuracy || 0;
      gameTypeCounts[gtype].totalScore += s.score || 0;
    });

    const gamesByType = {
      memory_match: {
        count: gameTypeCounts.memory_match.count,
        avgAccuracy: gameTypeCounts.memory_match.count > 0 ? Number((gameTypeCounts.memory_match.totalAcc / gameTypeCounts.memory_match.count).toFixed(1)) : 0,
        avgScore: gameTypeCounts.memory_match.count > 0 ? Math.round(gameTypeCounts.memory_match.totalScore / gameTypeCounts.memory_match.count) : 0,
      },
      pattern_recognition: {
        count: gameTypeCounts.pattern_recognition.count,
        avgAccuracy: gameTypeCounts.pattern_recognition.count > 0 ? Number((gameTypeCounts.pattern_recognition.totalAcc / gameTypeCounts.pattern_recognition.count).toFixed(1)) : 0,
        avgScore: gameTypeCounts.pattern_recognition.count > 0 ? Math.round(gameTypeCounts.pattern_recognition.totalScore / gameTypeCounts.pattern_recognition.count) : 0,
      },
      daily_routine_recall: {
        count: gameTypeCounts.daily_routine_recall.count,
        avgAccuracy: gameTypeCounts.daily_routine_recall.count > 0 ? Number((gameTypeCounts.daily_routine_recall.totalAcc / gameTypeCounts.daily_routine_recall.count).toFixed(1)) : 0,
        avgScore: gameTypeCounts.daily_routine_recall.count > 0 ? Math.round(gameTypeCounts.daily_routine_recall.totalScore / gameTypeCounts.daily_routine_recall.count) : 0,
      },
      object_recognition: {
        count: gameTypeCounts.object_recognition.count,
        avgAccuracy: gameTypeCounts.object_recognition.count > 0 ? Number((gameTypeCounts.object_recognition.totalAcc / gameTypeCounts.object_recognition.count).toFixed(1)) : 0,
        avgScore: gameTypeCounts.object_recognition.count > 0 ? Math.round(gameTypeCounts.object_recognition.totalScore / gameTypeCounts.object_recognition.count) : 0,
      },
    };

    // Games by difficulty level
    const gamesByDifficulty = {
      easy: sessions.filter((s) => s.difficulty === 1).length,
      medium: sessions.filter((s) => s.difficulty === 2).length,
      hard: sessions.filter((s) => s.difficulty === 3).length,
    };

    // Latest AI Recommended difficulty (friendly text)
    const latestDiffNum = sessions[0]?.difficulty || 1;
    const latestAiRecommendedDifficulty = latestDiffNum === 1 ? 'Easy' : (latestDiffNum === 2 ? 'Medium' : 'Hard');

    res.json({
      success: true,
      isEmpty: false,
      summary: {
        totalGamesCompleted: totalCount,
        averageAccuracy,
        averageScore,
        averageCompletionTime,
        averageCompletionRate,
        performanceTrend,
        latestAiRecommendedDifficulty,
      },
      gamesByType,
      gamesByDifficulty,
      mostRecentActivity: sessions[0],
      recentSessions: sessions.map((s) => ({
        id: s._id || s.id,
        gameType: s.gameType,
        difficulty: s.difficulty,
        accuracy: s.accuracy,
        score: s.score,
        completionTime: s.completionTime || s.duration || 0,
        completionRate: s.completionRate || 100,
        attempts: s.attempts || 0,
        completedAt: s.completedAt || s.createdAt,
      })),
    });
  } catch (error) {
    console.error('[CAREGIVER DASHBOARD API ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

/**
 * GET /api/caregiver/game-history
 * Returns recent sessions in table format
 */
export const getCaregiverGameHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!verifyCaregiverRole(req, res)) return;

    const sessions = await GameSession.find().sort({ completedAt: -1, createdAt: -1 }).limit(50);
    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getCaregiverPatientsList = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!verifyCaregiverRole(req, res)) return;
    const caregiverUid = req.user!.mongoId || req.user!.id || req.user!.firebaseUid;

    const mappings = await CaregiverPatient.find({
      $or: [{ caregiverId: caregiverUid }, { caregiverId: req.user!.firebaseUid }],
    });

    const patientUids = mappings.map((m) => m.patientId);

    const patientUsers = await User.find({
      $or: [{ _id: { $in: patientUids } }, { firebaseUid: { $in: patientUids } }],
    }).select('-passwordHash');

    const patientProfiles = await PatientProfile.find({
      $or: [{ userId: { $in: patientUids } }, { firebaseUid: { $in: patientUids } }],
    });

    const patientsWithStats = await Promise.all(
      patientUsers.map(async (u) => {
        const uid = u.firebaseUid || u._id.toString();
        const profile = patientProfiles.find(
          (p) => p.firebaseUid === uid || (p.userId && p.userId.toString() === u._id.toString())
        );

        const recentSessions = await GameSession.find({
          $or: [{ userId: uid }, { patientId: uid }],
        })
          .sort({ completedAt: -1, createdAt: -1 })
          .limit(10);

        const avgAcc =
          recentSessions.length > 0
            ? Number((recentSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / recentSessions.length).toFixed(1))
            : 0;

        return {
          id: u._id.toString(),
          uid,
          name: u.name,
          email: u.email,
          role: u.role,
          age: profile?.age || 74,
          gameLevels: profile?.gameLevels || {
            memory_match: 1,
            pattern_recognition: 1,
            daily_routine_recall: 1,
            object_recognition: 1,
          },
          accuracy: avgAcc,
          lastActive: recentSessions[0]?.completedAt || recentSessions[0]?.createdAt || u.updatedAt,
          totalSessions: recentSessions.length,
        };
      })
    );

    res.json({
      success: true,
      count: patientsWithStats.length,
      patients: patientsWithStats,
    });
  } catch (error) {
    console.error('[GET CAREGIVER PATIENTS LIST ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
