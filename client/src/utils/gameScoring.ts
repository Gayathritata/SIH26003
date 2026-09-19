/**
 * Reusable Game Scoring & Performance Tracking Service for MINDMATE NER
 */

export interface MemoryMatchGameInput {
  difficulty: number; // 1 = Easy (3 pairs), 2 = Medium (4 pairs), 3 = Hard (6 pairs)
  attempts: number;
  correctMatches: number;
  incorrectAttempts: number;
  completionTime: number; // in seconds
  startedAt: string; // ISO string
  completedAt: string; // ISO string
}

export interface CalculatedGameMetrics {
  gameType: string;
  difficulty: number;
  totalPairs: number;
  attempts: number;
  correctMatches: number;
  incorrectAttempts: number;
  accuracy: number; // percentage 0-100 (1 decimal place)
  completionTime: number; // seconds
  completionRate: number; // percentage 0-100
  score: number; // calculated transparent score
  startedAt: string;
  completedAt: string;
}

/**
 * Calculates transparent, actual performance-based score and metrics for Memory Match game.
 * Base points per match: 100
 * Penalty per incorrect attempt: 15
 * Time bonus: Max(0, 300 - completionTime * 3)
 * Difficulty multiplier: Easy (1.0x), Medium (1.2x), Hard (1.5x)
 */
export const calculateMemoryMatchScore = (input: MemoryMatchGameInput): CalculatedGameMetrics => {
  const { difficulty, attempts, correctMatches, incorrectAttempts, completionTime, startedAt, completedAt } = input;

  const totalPairs = difficulty === 1 ? 3 : (difficulty === 2 ? 4 : 6);
  
  // Calculate accuracy percentage from actual attempts
  const rawAccuracy = attempts > 0 ? (correctMatches / attempts) * 100 : 0;
  const accuracy = Number(Math.min(100, Math.max(0, rawAccuracy)).toFixed(1));

  // Completion rate percentage
  const rawCompletionRate = totalPairs > 0 ? (correctMatches / totalPairs) * 100 : 0;
  const completionRate = Number(Math.min(100, Math.max(0, rawCompletionRate)).toFixed(1));

  // Difficulty multiplier
  const diffMultiplier = difficulty === 1 ? 1.0 : (difficulty === 2 ? 1.2 : 1.5);

  // Score formula
  const matchPoints = correctMatches * 100;
  const errorPenalty = incorrectAttempts * 15;
  const timeBonus = Math.max(0, 300 - completionTime * 3);

  const rawScore = (matchPoints - errorPenalty + timeBonus) * diffMultiplier;
  const score = Math.max(0, Math.round(rawScore));

  return {
    gameType: 'memory_match',
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
  };
};
