import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import { calculateObjectRecognitionScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameHeader } from './common/GameHeader';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { Language } from '../../utils/i18n';

interface ObjectQuestion {
  objectName: string;
  emoji: string;
  category: string;
  prompt: string;
  options: string[];
}

const EASY_QUESTIONS: ObjectQuestion[] = [
  {
    objectName: 'Mango',
    emoji: '🥭',
    category: 'Fresh Fruit',
    prompt: 'What fruit is shown above?',
    options: ['Mango', 'Apple', 'Cup'],
  },
  {
    objectName: 'Cup',
    emoji: '☕',
    category: 'Kitchenware',
    prompt: 'What container is shown above?',
    options: ['Book', 'Cup', 'Chair'],
  },
  {
    objectName: 'Clock',
    emoji: '⏰',
    category: 'Household Item',
    prompt: 'What device tells time?',
    options: ['Clock', 'Umbrella', 'Flower'],
  },
];

const MEDIUM_QUESTIONS: ObjectQuestion[] = [
  {
    objectName: 'Book',
    emoji: '📖',
    category: 'Reading Item',
    prompt: 'What reading item is shown above?',
    options: ['Book', 'Paper', 'Magazine', 'Notebook'],
  },
  {
    objectName: 'Umbrella',
    emoji: '☂️',
    category: 'Weather Gear',
    prompt: 'What object protects you from rain?',
    options: ['Hat', 'Raincoat', 'Umbrella', 'Towel'],
  },
  {
    objectName: 'Flower',
    emoji: '🌸',
    category: 'Garden Plant',
    prompt: 'What beautiful plant is shown above?',
    options: ['Leaf', 'Tree', 'Flower', 'Grass'],
  },
];

const HARD_QUESTIONS: ObjectQuestion[] = [
  {
    objectName: 'Chair',
    emoji: '🪑',
    category: 'Furniture',
    prompt: 'What furniture piece is shown above?',
    options: ['Chair', 'Table', 'Stool', 'Bench', 'Couch'],
  },
  {
    objectName: 'Tea Cup',
    emoji: '🍵',
    category: 'Beverage Vessel',
    prompt: 'What cup used for hot tea is shown above?',
    options: ['Glass', 'Bottle', 'Tea Cup', 'Jug', 'Vase'],
  },
  {
    objectName: 'Traditional Basket',
    emoji: '🧺',
    category: 'Woven Craft',
    prompt: 'What traditional woven container is shown above?',
    options: ['Bag', 'Traditional Basket', 'Box', 'Pot', 'Tray'],
  },
];

interface ObjectRecognitionGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  lang?: Language | string;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const ObjectRecognitionGame: React.FC<ObjectRecognitionGameProps> = ({
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

  const handleSelectOption = (selectedOpt: string) => {
    if (!isGameActive || feedback !== null) return;

    const isCorrect = selectedOpt.toLowerCase().trim() === currentQuestion.objectName.toLowerCase().trim();

    if (isCorrect) {
      const nextCorrect = correctAnswers + 1;
      setCorrectAnswers(nextCorrect);
      setFeedback({ isCorrect: true, text: `Correct! 🎉 It's a ${currentQuestion.objectName}!` });

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

    const calculated = calculateObjectRecognitionScore({
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
        gameType: 'object_recognition',
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
      console.warn('[SAVE OBJECT GAME FAILED]', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <GameHeader
        title="👀 Object Recognition"
        subtitle="Identify familiar everyday objects."
        icon={<Search size={30} color="#14B8A6" />}
        difficulty={difficulty}
        elapsedSeconds={elapsedSeconds}
        correctCount={correctAnswers}
        totalCount={totalQuestions}
        attemptsCount={correctAnswers + incorrectAnswers}
        onNavigateBack={onNavigateBack}
        onChangeDifficulty={(d) => startNewGame(d)}
      />

      {/* Main Object Visualizer */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600' }}>
          Question {questionIndex + 1} of {totalQuestions}
        </span>

        {/* Object Large Icon */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            background: 'rgba(20, 184, 166, 0.15)',
            border: '2px solid #14B8A6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            boxShadow: '0 0 30px rgba(20, 184, 166, 0.35)',
          }}
        >
          {currentQuestion.emoji}
        </div>

        <span className="badge-pill badge-emerald" style={{ fontSize: '13px' }}>
          {currentQuestion.category}
        </span>

        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
          {currentQuestion.prompt}
        </h3>

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#10B981' : '#F43F5E',
              padding: '10px 20px',
              borderRadius: '14px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
            }}
          >
            {feedback.text}
          </div>
        )}
      </div>

      {/* Multiple-Choice Answer Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {currentQuestion.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleSelectOption(opt)}
            disabled={!isGameActive || feedback !== null}
            className="glass-panel-hover"
            style={{
              minHeight: '75px',
              borderRadius: '20px',
              background: 'rgba(30, 41, 59, 0.9)',
              border: '2px solid var(--border-glass-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '16px',
              fontSize: '20px',
              fontWeight: '800',
              color: '#FFFFFF',
            }}
          >
            {opt}
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
