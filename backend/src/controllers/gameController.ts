import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import GameSession from '../models/GameSession';
import GameContent from '../models/GameContent';
import PatientProfile from '../models/PatientProfile';
import { getMLDifficultyRecommendation } from '../services/mlClient';
import { checkAndUpdatePatientAlerts } from '../services/alertService';

export const createGameSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required. Verified JWT token missing.' });
      return;
    }

    // Always obtain user ID strictly from verified JWT
    const authenticatedUserId = req.user.mongoId || req.user.id || req.user.firebaseUid;
    if (!authenticatedUserId) {
      res.status(401).json({ success: false, error: 'Invalid user token payload.' });
      return;
    }

    const {
      gameType,
      difficulty,
      totalPairs,
      attempts,
      correctMatches,
      incorrectAttempts,
      accuracy,
      completionTime,
      completionRate,
      score,
      startedAt,
      completedAt,
    } = req.body;

    // Normalize and validate gameType
    let validGameType = (gameType || 'memory_match').toString().toLowerCase().trim();
    if (validGameType === 'memory') validGameType = 'memory_match';
    if (validGameType === 'pattern') validGameType = 'pattern_recognition';
    if (validGameType === 'routine') validGameType = 'daily_routine_recall';
    if (validGameType === 'object_rec') validGameType = 'object_recognition';

    const ALLOWED_GAME_TYPES = [
      'memory_match',
      'pattern_recognition',
      'daily_routine_recall',
      'object_recognition',
    ];

    if (!ALLOWED_GAME_TYPES.includes(validGameType)) {
      res.status(400).json({
        success: false,
        error: `Invalid gameType '${gameType}'. Allowed game types: ${ALLOWED_GAME_TYPES.join(', ')}`,
      });
      return;
    }

    // Normalize and validate difficulty ('easy'|'medium'|'hard' or 1|2|3)
    let numDifficulty = 1;
    if (typeof difficulty === 'string') {
      const lowerDiff = difficulty.toLowerCase().trim();
      if (lowerDiff === 'easy' || lowerDiff === '1') numDifficulty = 1;
      else if (lowerDiff === 'medium' || lowerDiff === '2') numDifficulty = 2;
      else if (lowerDiff === 'hard' || lowerDiff === '3') numDifficulty = 3;
      else numDifficulty = Number(difficulty);
    } else {
      numDifficulty = Number(difficulty ?? 1);
    }

    if (isNaN(numDifficulty) || numDifficulty < 1 || numDifficulty > 10) {
      res.status(400).json({ success: false, error: 'Invalid difficulty level. Must be easy, medium, hard or a number between 1 and 10.' });
      return;
    }

    // Validation: numeric metrics
    const numAttempts = Number(attempts ?? 0);
    const numCorrect = Number(correctMatches ?? 0);
    const numIncorrect = Number(incorrectAttempts ?? 0);
    const numAccuracy = Number(accuracy ?? 0);
    const numCompletionTime = Number(completionTime ?? 0);
    const numCompletionRate = Number(completionRate ?? 100);
    const numScore = Number(score ?? 0);
    const numTotalPairs = Number(totalPairs ?? (numDifficulty === 1 ? 3 : numDifficulty === 2 ? 4 : 6));

    if (
      isNaN(numAttempts) || numAttempts < 0 ||
      isNaN(numCorrect) || numCorrect < 0 ||
      isNaN(numIncorrect) || numIncorrect < 0 ||
      isNaN(numAccuracy) || numAccuracy < 0 || numAccuracy > 100 ||
      isNaN(numCompletionTime) || numCompletionTime < 0 ||
      isNaN(numCompletionRate) || numCompletionRate < 0 || numCompletionRate > 100 ||
      isNaN(numScore) || numScore < 0
    ) {
      res.status(400).json({ success: false, error: 'Malformed request: Numeric game metrics are out of valid range.' });
      return;
    }

    const session = await GameSession.create({
      userId: authenticatedUserId,
      patientId: authenticatedUserId,
      gameType: validGameType,
      difficulty: numDifficulty,
      totalPairs: numTotalPairs,
      attempts: numAttempts,
      correctMatches: numCorrect,
      incorrectAttempts: numIncorrect,
      accuracy: numAccuracy,
      completionTime: numCompletionTime,
      completionRate: numCompletionRate,
      score: numScore,
      startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - numCompletionTime * 1000),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      reactionTime: numCompletionTime > 0 && numAttempts > 0 ? Number((numCompletionTime / numAttempts).toFixed(2)) : 0,
      mistakes: numIncorrect,
      duration: numCompletionTime,
      aiRecommendedDifficulty: numDifficulty,
      aiConfidence: 1.0,
      aiReason: 'STEP 5 Initial Game Logic',
    });

    // Update cognitive level in PatientProfile if available
    await PatientProfile.findOneAndUpdate(
      { $or: [{ userId: authenticatedUserId }, { firebaseUid: authenticatedUserId }] },
      { cognitiveLevel: numDifficulty }
    ).catch(() => {});

    // Evaluate caregiver alerts
    checkAndUpdatePatientAlerts(authenticatedUserId).catch((err) =>
      console.error('[ALERT EVALUATION ERROR]', err)
    );

    res.status(201).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('[CREATE GAME SESSION ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getUserGameSessions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const userId = req.user.mongoId || req.user.id || req.user.firebaseUid;

    const sessions = await GameSession.find({
      $or: [{ userId }, { patientId: userId }],
    })
      .sort({ completedAt: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error('[GET GAME SESSIONS ERROR]', error);
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};

export const getGameContent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { gameType, language, region, difficulty } = req.query;

    const filter: any = {};
    if (gameType) filter.gameType = gameType;
    if (language) filter.language = language;
    if (region) filter.region = region;
    if (difficulty) filter.difficulty = Number(difficulty);

    let content = await GameContent.find(filter);

    if (content.length === 0 && (language || region)) {
      content = await GameContent.find({
        gameType: gameType || 'memory',
        language: 'en',
      });
    }

    res.json({ success: true, count: content.length, content });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
};
