import React, { useState, useEffect, useRef } from 'react';
import { Target, RotateCcw, Volume2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { calculatePatternRecognitionScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { getPatternQuestionsForLevel } from '../../utils/levelDifficulty';
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

interface Props {
  initialDifficulty?: number;
  difficulty?: number;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const PatternRecognitionGame: React.FC<Props> = ({
  initialDifficulty = 1,
  difficulty: propDifficulty,
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const [difficulty, setDifficulty] = useState<number>(propDifficulty || initialDifficulty);
  const [questions, setQuestions] = useState<PatternQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<CalculatedGameMetrics | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    const pool = getPatternQuestionsForLevel(selectedDiff);

    setQuestions(pool);
    setCurrentQuestionIndex(0);
    setAttempts(0);
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
    const activeLvl = propDifficulty || initialDifficulty;
    setDifficulty(activeLvl);
    startNewGame(activeLvl);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [propDifficulty, initialDifficulty]);

  if (questions.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '32px' }}>
        Loading pattern questions...
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (option: PatternItem) => {
    if (!isGameActive || feedback !== null) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isCorrect = option.name === currentQuestion.correctAnswer.name;

    if (isCorrect) {
      const newCorrect = correctAnswers + 1;
      setCorrectAnswers(newCorrect);
      setFeedback({ text: t('correctAnswer'), isCorrect: true });

      if (voiceEnabled) speak(t('correctAnswer'), true);

      setTimeout(() => {
        setFeedback(null);
        if (currentQuestionIndex + 1 < totalQuestions) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else {
          finishGame(newAttempts, newCorrect, incorrectAnswers);
        }
      }, 1000);
    } else {
      const newIncorrect = incorrectAnswers + 1;
      setIncorrectAnswers(newIncorrect);
      setFeedback({ text: t('tryAgain'), isCorrect: false });

      if (voiceEnabled) speak(t('tryAgain'), true);

      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const finishGame = async (
    finalAttempts: number,
    finalCorrect: number,
    finalIncorrect: number
  ) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const completedAtISO = new Date().toISOString();
    const startedAtISO = new Date(startTimeRef.current).toISOString();
    const finalCompletionTime = Math.max(1, elapsedSeconds);

    setIsGameActive(false);

    if (voiceEnabled) speak(t('gameComplete'), true);

    const calculated = calculatePatternRecognitionScore({
      difficulty,
      correctAnswers: finalCorrect,
      incorrectAnswers: finalIncorrect,
      completionTime: finalCompletionTime,
      totalQuestions,
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
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '40px', padding: '0 14px', fontSize: '14px' }}
              aria-label={t('backToGames')}
            >
              <ArrowLeft size={18} /> {t('backToGames')}
            </button>
          )}
          <div>
            <h2 className="text-hero-title" style={{ fontSize: '24px', margin: 0 }}>
              🔷 {t('patternGameTitle')} (Level {difficulty} / 100)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontWeight: '500' }}>
              {t('patternInstructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak(t('patternInstructions'), true)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '40px', padding: '0 12px', fontSize: '13px', color: 'var(--accent-amber)' }}
          title={t('listenInstructions')}
          aria-label={t('listenInstructions')}
        >
          <Volume2 size={16} /> {t('listenInstructions')}
        </button>
      </div>

      {/* Main Pattern Sequence Display */}
      <div className="glass-panel" style={{ padding: '28px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF' }}>
        <span style={{ fontSize: '16px', color: 'var(--text-primary)', fontWeight: '700' }}>
          {t('patternSelectMissing')}
        </span>

        {/* Sequence Grid */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {currentQuestion.sequence.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: '70px',
                height: '70px',
                borderRadius: '16px',
                background: '#F8FAFC',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Missing Item Badge */}
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '16px',
              background: '#E0F2FE',
              border: '2px solid var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: 'var(--accent-primary)',
            }}
          >
            ?
          </div>
        </div>

        {/* Feedback Bar */}
        {feedback && (
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#15803D' : '#BE123C',
              padding: '10px 20px',
              borderRadius: '14px',
              background: feedback.isCorrect ? '#DCFCE7' : '#FFE4E6',
              border: feedback.isCorrect ? '1px solid #86EFAC' : '1px solid #FECDD3',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
            }}
          >
            {feedback.isCorrect ? <CheckCircle2 size={20} /> : null}
            {feedback.text}
          </div>
        )}
      </div>

      {/* Answer Choices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '12px' }}>
        {currentQuestion.options.map((option) => (
          <button
            key={option.name}
            type="button"
            onClick={() => handleSelectOption(option)}
            disabled={!isGameActive || feedback !== null}
            style={{
              minHeight: '110px',
              borderRadius: '16px',
              background: '#FFFFFF',
              border: '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '44px', lineHeight: 1 }}>{option.emoji}</span>
          </button>
        ))}
      </div>

      {/* Restart Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '6px' }}>
        <button
          type="button"
          onClick={() => startNewGame(difficulty)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '44px', padding: '0 20px', fontSize: '15px' }}
        >
          <RotateCcw size={16} /> Restart Game
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
