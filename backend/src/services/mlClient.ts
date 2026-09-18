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

    if (scoreIdx >= 0.75 && params.accuracy >= 0.75 && params.mistakes <= 2) {
      recLevel = Math.min(5, prevLevel + 1);
      reason = 'Accuracy and response speed improved. Increasing difficulty level.';
      trend = 'improving';
    } else if (scoreIdx < 0.45 || params.accuracy < 0.5 || params.reaction_time > 8.0) {
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
