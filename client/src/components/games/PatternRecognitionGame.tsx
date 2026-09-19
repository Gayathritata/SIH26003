import React, { useState, useEffect, useRef } from 'react';
import { Target, RotateCcw } from 'lucide-react';
import { calculatePatternRecognitionScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameHeader } from './common/GameHeader';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { Language } from '../../utils/i18n';

interface PatternItem {
  name: string;
  emoji: string;
}

interface PatternQuestion {
  sequence: PatternItem[];
  correctAnswer: PatternItem;
  options: PatternItem[];
}

// Culturally familiar elderly objects & emojis
const EASY_QUESTIONS: PatternQuestion[] = [
  {
    sequence: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Apple', emoji: '🍎' },
    ],
    correctAnswer: { name: 'Banana', emoji: '🍌' },
    options: [
      { name: 'Banana', emoji: '🍌' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Mango', emoji: '🥭' },
    ],
  },
  {
    sequence: [
      { name: 'Cup', emoji: '☕' },
      { name: 'Book', emoji: '📖' },
      { name: 'Cup', emoji: '☕' },
    ],
    correctAnswer: { name: 'Book', emoji: '📖' },
    options: [
      { name: 'Flower', emoji: '🌸' },
      { name: 'Book', emoji: '📖' },
      { name: 'Cup', emoji: '☕' },
    ],
  },
  {
    sequence: [
      { name: 'Clock', emoji: '⏰' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Clock', emoji: '⏰' },
    ],
    correctAnswer: { name: 'Chair', emoji: '🪑' },
    options: [
      { name: 'Chair', emoji: '🪑' },
      { name: 'Umbrella', emoji: '☂️' },
      { name: 'Clock', emoji: '⏰' },
    ],
  },
];

const MEDIUM_QUESTIONS: PatternQuestion[] = [
  {
    sequence: [
      { name: 'Flower', emoji: '🌸' },
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Flower', emoji: '🌸' },
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Flower', emoji: '🌸' },
    ],
    correctAnswer: { name: 'Leaf', emoji: '🍃' },
    options: [
      { name: 'Flower', emoji: '🌸' },
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Cup', emoji: '☕' },
    ],
  },
  {
    sequence: [
      { name: 'Mango', emoji: '🥭' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Cup', emoji: '☕' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Mango', emoji: '🥭' },
    ],
    correctAnswer: { name: 'Cup', emoji: '☕' },
    options: [
      { name: 'Cup', emoji: '☕' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Book', emoji: '📖' },
      { name: 'Clock', emoji: '⏰' },
    ],
  },
  {
    sequence: [
      { name: 'Umbrella', emoji: '☂️' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Umbrella', emoji: '☂️' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Umbrella', emoji: '☂️' },
    ],
    correctAnswer: { name: 'Chair', emoji: '🪑' },
    options: [
      { name: 'Chair', emoji: '🪑' },
      { name: 'Umbrella', emoji: '☂️' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Flower', emoji: '🌸' },
    ],
  },
];

const HARD_QUESTIONS: PatternQuestion[] = [
  {
    sequence: [
      { name: 'Clock', emoji: '⏰' },
      { name: 'Book', emoji: '📖' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Clock', emoji: '⏰' },
      { name: 'Book', emoji: '📖' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Clock', emoji: '⏰' },
    ],
    correctAnswer: { name: 'Book', emoji: '📖' },
    options: [
      { name: 'Book', emoji: '📖' },
      { name: 'Chair', emoji: '🪑' },
      { name: 'Clock', emoji: '⏰' },
      { name: 'Umbrella', emoji: '☂️' },
    ],
  },
  {
    sequence: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Apple', emoji: '🍎' },
    ],
    correctAnswer: { name: 'Mango', emoji: '🥭' },
    options: [
      { name: 'Banana', emoji: '🍌' },
      { name: 'Mango', emoji: '🥭' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Cup', emoji: '☕' },
    ],
  },
  {
    sequence: [
      { name: 'Cup', emoji: '☕' },
      { name: 'Flower', emoji: '🌸' },
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Cup', emoji: '☕' },
      { name: 'Flower', emoji: '🌸' },
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Cup', emoji: '☕' },
    ],
    correctAnswer: { name: 'Flower', emoji: '🌸' },
    options: [
      { name: 'Leaf', emoji: '🍃' },
      { name: 'Flower', emoji: '🌸' },
      { name: 'Cup', emoji: '☕' },
      { name: 'Book', emoji: '📖' },
    ],
  },
];

interface PatternRecognitionGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  lang?: Language | string;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({
  difficulty: propDiff,
  initialDifficulty = 1,
  lang = 'en',
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const [difficulty, setDifficulty] = useState<number>(propDiff || initialDifficulty);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  // Performance tracking
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Timer & completion states
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<CalculatedGameMetrics | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const questionsList = difficulty === 1 ? EASY_QUESTIONS : (difficulty === 2 ? MEDIUM_QUESTIONS : HARD_QUESTIONS);
  const currentQuestion = questionsList[questionIndex % questionsList.length];
  const totalQuestions = questionsList.length;

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    setQuestionIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setFeedback(null);
    setElapsedSeconds(0);
    setIsGameComplete(false);
    setMetrics(null);
    setIsGameActive(true);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    startNewGame(difficulty);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [difficulty]);

  const handleSelectOption = (option: PatternItem) => {
    if (!isGameActive || feedback !== null) return;

    const isCorrect = option.name === currentQuestion.correctAnswer.name;

    if (isCorrect) {
      const nextCorrect = correctAnswers + 1;
      setCorrectAnswers(nextCorrect);
      setFeedback({ isCorrect: true, text: 'Correct! 🎉' });

      setTimeout(() => {
        setFeedback(null);
        if (questionIndex + 1 >= totalQuestions) {
          handleGameCompletion(nextCorrect, incorrectAnswers);
        } else {
          setQuestionIndex((prev) => prev + 1);
        }
      }, 1000);
    } else {
      const nextIncorrect = incorrectAnswers + 1;
      setIncorrectAnswers(nextIncorrect);
      setFeedback({ isCorrect: false, text: 'Try again.' });

      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleGameCompletion = async (finalCorrect: number, finalIncorrect: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsGameActive(false);
    const completedAtISO = new Date().toISOString();
    const startedAtISO = new Date(startTimeRef.current).toISOString();
    const finalCompletionTime = Math.max(1, elapsedSeconds);

    const calculated = calculatePatternRecognitionScore({
      difficulty,
      totalQuestions,
      correctAnswers: finalCorrect,
      incorrectAnswers: finalIncorrect,
      completionTime: finalCompletionTime,
      startedAt: startedAtISO,
      completedAt: completedAtISO,
    });

    setMetrics(calculated);
    setIsGameComplete(true);

    setIsSaving(true);
    try {
      await submitGameSession({
        gameType: 'pattern_recognition',
        difficulty: calculated.difficulty,
        totalPairs: totalQuestions,
        attempts: calculated.attempts,
        correctMatches: calculated.correctAnswers,
        incorrectAttempts: calculated.incorrectAnswers,
        accuracy: calculated.accuracy,
        completionTime: calculated.completionTime,
        completionRate: calculated.completionRate,
        score: calculated.score,
        startedAt: calculated.startedAt,
        completedAt: calculated.completedAt,
      });
      if (onSessionSaved) onSessionSaved();
      if (onFinish) onFinish(calculated);
    } catch (err) {
      console.warn('[SAVE PATTERN GAME FAILED]', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GameHeader
        title="🔷 Pattern Recognition"
        subtitle="Find the missing part of the pattern."
        icon={<Target size={30} color="#F59E0B" />}
        difficulty={difficulty}
        elapsedSeconds={elapsedSeconds}
        correctCount={correctAnswers}
        totalCount={totalQuestions}
        attemptsCount={correctAnswers + incorrectAnswers}
        onNavigateBack={onNavigateBack}
        onChangeDifficulty={(d) => startNewGame(d)}
      />

      {/* Main Pattern Sequence Display */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <span style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Question {questionIndex + 1} of {totalQuestions}: What object comes next?
        </span>

        {/* Sequence Grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentQuestion.sequence.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Missing Item Question Mark */}
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              border: '2px solid #FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px',
              fontWeight: '800',
              color: '#FFFFFF',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.5)',
              animation: 'pulse 2s infinite',
            }}
          >
            ?
          </div>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#10B981' : '#F43F5E',
              padding: '10px 20px',
              borderRadius: '14px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              display: 'inline-block',
              margin: '0 auto',
            }}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
        {currentQuestion.options.map((option) => (
          <button
            key={option.name}
            type="button"
            onClick={() => handleSelectOption(option)}
            disabled={!isGameActive || feedback !== null}
            className="glass-panel-hover"
            style={{
              minHeight: '110px',
              borderRadius: '20px',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '2px solid var(--border-glass-bright)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '16px',
            }}
          >
            <span style={{ fontSize: '42px', lineHeight: 1 }}>{option.emoji}</span>
            <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF' }}>{option.name}</span>
          </button>
        ))}
      </div>

      {/* Restart Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
        <button
          type="button"
          onClick={() => startNewGame(difficulty)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '48px', padding: '0 24px', fontSize: '16px', borderRadius: '14px' }}
        >
          <RotateCcw size={18} /> Restart Game
        </button>
      </div>

      {/* Completion Modal */}
      {isGameComplete && metrics && (
        <GameCompletionScreen
          metrics={metrics}
          isSaving={isSaving}
          onPlayAgain={() => startNewGame(difficulty)}
          onNavigateBack={onNavigateBack}
        />
      )}
    </div>
  );
};
