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

export interface QuizGameInput {
  difficulty: number; // 1 = Easy, 2 = Medium, 3 = Hard
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  completionTime: number; // in seconds
  startedAt: string;
  completedAt: string;
}

export interface CalculatedGameMetrics {
  gameType: string;
  difficulty: number;
  totalPairs?: number;
  totalQuestions?: number;
  attempts: number;
  correctMatches: number;
  incorrectAttempts: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  accuracy: number; // percentage 0-100 (1 decimal place)
  completionTime: number; // seconds
  completionRate: number; // percentage 0-100
  score: number; // calculated transparent score
  startedAt: string;
  completedAt: string;
}

import { getMemoryMatchConfig } from './levelDifficulty';

/**
 * Calculates transparent, actual performance-based score and metrics for Memory Match game.
 */
export const calculateMemoryMatchScore = (input: MemoryMatchGameInput): CalculatedGameMetrics => {
  const { difficulty, attempts, correctMatches, incorrectAttempts, completionTime, startedAt, completedAt } = input;

  const config = getMemoryMatchConfig(difficulty);
  const totalPairs = config.totalPairs;
  
  // Calculate accuracy percentage from actual attempts
  const rawAccuracy = attempts > 0 ? (correctMatches / attempts) * 100 : 0;
  const accuracy = Number(Math.min(100, Math.max(0, rawAccuracy)).toFixed(1));

  // Completion rate percentage
  const rawCompletionRate = totalPairs > 0 ? (correctMatches / totalPairs) * 100 : 0;
  const completionRate = Number(Math.min(100, Math.max(0, rawCompletionRate)).toFixed(1));

  // Difficulty multiplier
  const diffMultiplier = 1.0 + (difficulty - 1) * 0.15;

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

/**
 * Generic scoring calculator for question/ordering based cognitive games (Pattern Recognition, Routine Recall, Object Recognition).
 */
const calculateQuizGameScore = (
  gameType: 'pattern_recognition' | 'daily_routine_recall' | 'object_recognition',
  input: QuizGameInput
): CalculatedGameMetrics => {
  const { difficulty, totalQuestions, correctAnswers, incorrectAnswers, completionTime, startedAt, completedAt } = input;

  const totalAttempts = correctAnswers + incorrectAnswers;
  const rawAccuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;
  const accuracy = Number(Math.min(100, Math.max(0, rawAccuracy)).toFixed(1));

  const rawCompletionRate = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
  const completionRate = Number(Math.min(100, Math.max(0, rawCompletionRate)).toFixed(1));

  const diffMultiplier = 1.0 + (difficulty - 1) * 0.15;

  const basePoints = correctAnswers * 100;
  const penalty = incorrectAnswers * 20;
  const timeBonus = Math.max(0, 240 - completionTime * 2);

  const rawScore = (basePoints - penalty + timeBonus) * diffMultiplier;
  const score = Math.max(0, Math.round(rawScore));

  return {
    gameType,
    difficulty,
    totalQuestions,
    attempts: totalAttempts,
    correctMatches: correctAnswers,
    incorrectAttempts: incorrectAnswers,
    correctAnswers,
    incorrectAnswers,
    accuracy,
    completionTime,
    completionRate,
    score,
    startedAt,
    completedAt,
  };
};

export const calculatePatternRecognitionScore = (input: QuizGameInput): CalculatedGameMetrics =>
  calculateQuizGameScore('pattern_recognition', input);

export const calculateRoutineRecallScore = (input: QuizGameInput): CalculatedGameMetrics =>
  calculateQuizGameScore('daily_routine_recall', input);

export const calculateObjectRecognitionScore = (input: QuizGameInput): CalculatedGameMetrics =>
  calculateQuizGameScore('object_recognition', input);
