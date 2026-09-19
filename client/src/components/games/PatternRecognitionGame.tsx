import React, { useState, useEffect, useRef } from 'react';
import { Target, RotateCcw, Volume2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { calculatePatternRecognitionScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { useAccessibility } from '../../context/AccessibilityContext';

interface PatternItem {
  name: string;
  emoji: string;
}

interface PatternQuestion {
  sequence: PatternItem[];
  correctAnswer: PatternItem;
  options: PatternItem[];
}

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
];

interface PatternRecognitionGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({
  difficulty: propDiff,
  initialDifficulty = 1,
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const [difficulty, setDifficulty] = useState<number>(propDiff || initialDifficulty);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

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

    if (voiceEnabled) {
      speak(t('patternInstructions'), true);
    }
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
      setFeedback({ isCorrect: true, text: `${t('correctAnswer')} 🎉` });

      if (voiceEnabled) {
        speak(t('correctAnswer'), true);
      }

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
      setFeedback({ isCorrect: false, text: t('tryAgain') });

      if (voiceEnabled) {
        speak(t('tryAgain'), true);
      }

      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleGameCompletion = async (finalCorrect: number, finalIncorrect: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsGameActive(false);

    if (voiceEnabled) {
      speak(t('gameComplete'), true);
    }

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
      
      {/* Header */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '44px', padding: '0 16px', fontSize: '15px' }}
              aria-label={t('backToGames')}
            >
              <ArrowLeft size={20} /> {t('backToGames')}
            </button>
          )}
          <div>
            <h2 className="text-hero-title" style={{ fontSize: '26px', margin: 0 }}>
              🔷 {t('patternGameTitle')}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '600' }}>
              {t('patternInstructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak(t('patternInstructions'), true)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px', color: '#FCD34D', border: '1px solid #F59E0B' }}
          title={t('listenInstructions')}
          aria-label={t('listenInstructions')}
        >
          <Volume2 size={18} /> {t('listenInstructions')}
        </button>
      </div>

      {/* Main Pattern Sequence Display */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <span style={{ fontSize: '18px', color: '#FFFFFF', fontWeight: '700' }}>
          {t('patternSelectMissing')}
        </span>

        {/* Sequence Grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {currentQuestion.sequence.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: '76px',
                height: '76px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '44px',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Missing Item Question Mark */}
          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              border: '3px solid #FBBF24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '38px',
              fontWeight: '800',
              color: '#FFFFFF',
              boxShadow: '0 0 24px rgba(245, 158, 11, 0.5)',
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
              color: feedback.isCorrect ? '#6EE7B7' : '#FDA4AF',
              padding: '12px 24px',
              borderRadius: '16px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: feedback.isCorrect ? '2px solid #10B981' : '2px solid #F43F5E',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              margin: '0 auto',
            }}
          >
            {feedback.isCorrect ? <CheckCircle2 size={24} /> : null}
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
              minHeight: '120px',
              borderRadius: '22px',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '3px solid var(--border-glass-bright)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '16px',
            }}
          >
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{option.emoji}</span>
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
          <RotateCcw size={18} /> {t('startGame')}
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
