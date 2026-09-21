import axios from 'axios';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export interface MLRecommendationParams {
  accuracy: number;
  reaction_time: number;
  mistakes: number;
  previous_score: number;
  previous_difficulty: number;
  game_type: string;
  mood?: string;
  completion_rate?: number;
}

export interface MLRecommendationResult {
  recommended_difficulty: number;
  confidence: number;
  reason: string;
  engine_used: string;
  previous_difficulty: number;
  performance_trend: string;
}

export interface MLPredictDifficultyParams {
  accuracy: number;
  score: number;
  completionTime: number;
  attempts: number;
  incorrectAttempts: number;
  correctAnswers: number;
  completionRate: number;
  previousDifficulty: string;
  gameType?: string;
}

export interface MLPredictDifficultyResponse {
  recommendedDifficulty: 'easy' | 'medium' | 'hard';
  confidence: number;
  probabilities: { easy: number; medium: number; hard: number };
  explanation?: string;
}

export const predictDifficultyFromML = async (
  params: MLPredictDifficultyParams
): Promise<MLPredictDifficultyResponse> => {
  try {
    const response = await axios.post<MLPredictDifficultyResponse>(
      `${ML_SERVICE_URL}/predict-difficulty`,
      params,
      { timeout: 4000 }
    );
    return response.data;
  } catch (error: any) {
    console.warn(`[ML CLIENT WARNING] FastAPI ML service unreachable at ${ML_SERVICE_URL}/predict-difficulty: ${error.message}. Using deterministic fallback.`);
    
    // Deterministic fallback rule when ML server is unreachable
    const accuracy = params.accuracy > 1.0 ? params.accuracy / 100.0 : params.accuracy;
    let recDiff: 'easy' | 'medium' | 'hard' = 'medium';
    let conf = 0.85;

    if (accuracy >= 0.80 && params.incorrectAttempts <= 1) {
      recDiff = 'hard';
      conf = 0.88;
    } else if (accuracy < 0.55 || params.incorrectAttempts >= 3 || params.completionTime > 60) {
      recDiff = 'easy';
      conf = 0.82;
    }

    const probs = {
      easy: recDiff === 'easy' ? 0.82 : 0.09,
      medium: recDiff === 'medium' ? 0.85 : 0.08,
      hard: recDiff === 'hard' ? 0.88 : 0.07,
    };

    return {
      recommendedDifficulty: recDiff,
      confidence: conf,
      probabilities: probs,
      explanation: `Rule Fallback: Recommended ${recDiff} based on recent accuracy (${Math.round(accuracy * 100)}%).`,
    };
  }
};

export const getMLDifficultyRecommendation = async (
  params: MLRecommendationParams
): Promise<MLRecommendationResult> => {
  try {
    const response = await axios.post<MLRecommendationResult>(
      `${ML_SERVICE_URL}/ai/recommend-difficulty`,
      params,
      { timeout: 4000 }
    );
    return response.data;
  } catch (error) {
    console.warn(`[ML CLIENT WARNING] Python ML service unavailable at ${ML_SERVICE_URL}. Using deterministic rule-based fallback.`);
    
    // Deterministic Rule Fallback logic inside Node.js
    const prevLevel = Math.max(1, Math.min(5, params.previous_difficulty));
    const speedFactor = Math.max(0, Math.min(1, (10.0 - params.reaction_time) / 10.0));
    const mistakeFactor = Math.max(0, 1.0 - params.mistakes * 0.2);
    const scoreIdx = params.accuracy * 0.5 + speedFactor * 0.3 + mistakeFactor * 0.2;

    let recLevel = prevLevel;
    let reason = '';
    let trend = 'stable';

    if (scoreIdx >= 0.50 && params.accuracy >= 0.50 && params.mistakes <= 4) {
      recLevel = Math.min(5, prevLevel + 1);
      reason = 'Accuracy and response speed improved. Increasing difficulty level.';
      trend = 'improving';
    } else if (scoreIdx < 0.35 || params.accuracy < 0.35 || params.reaction_time > 8.0) {
      recLevel = Math.max(1, prevLevel - 1);
      reason = 'Accuracy decreased or reaction time increased. Lowering difficulty for patient comfort.';
      trend = 'declining';
    } else {
      recLevel = prevLevel;
      reason = 'Performance remains steady. Maintaining current difficulty level.';
      trend = 'stable';
    }

    return {
      recommended_difficulty: recLevel,
      confidence: 0.85,
      reason: `Rule Fallback: ${reason}`,
      engine_used: 'Deterministic Rule Fallback',
      previous_difficulty: prevLevel,
      performance_trend: trend,
    };
  }
};

export const getMLPerformanceAnalysis = async (
  baselineScore: number,
  todayScore: number,
  patientName: string
) => {
  try {
    const response = await axios.post(
      `${ML_SERVICE_URL}/ai/analyze-performance`,
      {
        recent_baseline_score: baselineScore,
        today_score: todayScore,
        patient_name: patientName,
      },
      { timeout: 4000 }
    );
    return response.data;
  } catch (error) {
    // Fallback detection
    const pctChange = baselineScore > 0 ? ((todayScore - baselineScore) / baselineScore) * 100 : 0;
    const alertTriggered = pctChange < -20.0;
    return {
      alert_triggered: alertTriggered,
      severity: alertTriggered ? 'medium' : 'none',
      message: alertTriggered
        ? `Performance Alert: ${patientName}'s score today (${Math.round(todayScore)}%) dropped by ${Math.abs(Math.round(pctChange))}% below recent baseline.`
        : `Performance baseline is normal (${Math.round(pctChange)}%).`,
      baseline_score: baselineScore,
      today_score: todayScore,
      percentage_change: Math.round(pctChange),
    };
  }
};
