import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import GameSession from '../models/GameSession';
import GameContent from '../models/GameContent';
import PatientProfile from '../models/PatientProfile';
import { getMLDifficultyRecommendation } from '../services/mlClient';
import { checkAndUpdatePatientAlerts } from '../services/alertService';

export const createGameSession = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      gameType,
      difficulty,
      score,
      accuracy,
      reactionTime,
      mistakes,
      completionRate,
      duration,
      attempts,
      mood,
    } = req.body;

    const targetPatientId = patientId || req.user?.firebaseUid;

    if (!targetPatientId) {
      res.status(400).json({ success: false, error: 'Patient ID is required.' });
      return;
    }

    // Call ML Engine for adaptive difficulty recommendation
    const mlResult = await getMLDifficultyRecommendation({
      accuracy: accuracy !== undefined ? accuracy : score / 100,
      reaction_time: reactionTime || 4.5,
      mistakes: mistakes || 0,
      previous_score: score,
      previous_difficulty: difficulty || 2,
      game_type: gameType || 'memory',
      mood: mood || 'good',
      completion_rate: completionRate || 1.0,
    });

    const session = await GameSession.create({
      patientId: targetPatientId,
      gameType: gameType || 'memory',
      difficulty: difficulty || 2,
      score: score || 80,
      accuracy: accuracy !== undefined ? accuracy : score / 100,
      reactionTime: reactionTime || 4.5,
      mistakes: mistakes || 0,
      completionRate: completionRate || 1.0,
      duration: duration || 45,
      attempts: attempts || 1,
      mood: mood || 'good',
      aiRecommendedDifficulty: mlResult.recommended_difficulty,
      aiConfidence: mlResult.confidence,
      aiReason: mlResult.reason,
    });

    // Update cognitive level in PatientProfile
    await PatientProfile.findOneAndUpdate(
      { firebaseUid: targetPatientId },
      { cognitiveLevel: mlResult.recommended_difficulty }
    );

    // Trigger alert evaluation asynchronously
    checkAndUpdatePatientAlerts(targetPatientId).catch((err) =>
      console.error('[ALERT EVALUATION ERROR]', err)
    );

    res.status(201).json({
      success: true,
      session,
      aiRecommendation: mlResult,
    });
  } catch (error) {
    console.error('[CREATE GAME SESSION ERROR]', error);
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

    // If empty for specific language/region, fallback to English / general content
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
