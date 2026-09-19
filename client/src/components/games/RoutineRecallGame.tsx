import React, { useState, useEffect, useRef } from 'react';
import { Calendar, RotateCcw, CheckCircle2, ArrowUp, ArrowDown, Volume2, ArrowLeft } from 'lucide-react';
import { calculateRoutineRecallScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { useAccessibility } from '../../context/AccessibilityContext';

export interface RoutineActivity {
  id: string;
  nameKey: string;
  emoji: string;
  correctOrder: number;
}

const EASY_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', nameKey: 'routineStep1', emoji: '🌅', correctOrder: 1 },
  { id: 'breakfast', nameKey: 'routineStep3', emoji: '🥣', correctOrder: 2 },
  { id: 'sleep', nameKey: 'routineStep4', emoji: '🌙', correctOrder: 3 },
];

const MEDIUM_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', nameKey: 'routineStep1', emoji: '🌅', correctOrder: 1 },
  { id: 'teeth', nameKey: 'routineStep2', emoji: '🪥', correctOrder: 2 },
  { id: 'breakfast', nameKey: 'routineStep3', emoji: '🥣', correctOrder: 3 },
  { id: 'medicine', nameKey: 'routineStep4', emoji: '💊', correctOrder: 4 },
];

interface RoutineRecallGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const RoutineRecallGame: React.FC<RoutineRecallGameProps> = ({
  difficulty: propDiff,
  initialDifficulty = 1,
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const [difficulty, setDifficulty] = useState<number>(propDiff || initialDifficulty);
  const [currentList, setCurrentList] = useState<RoutineActivity[]>([]);

  const [attempts, setAttempts] = useState<number>(0);
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

  const getBaseActivities = (diff: number) => {
    if (diff === 1) return EASY_ACTIVITIES;
    return MEDIUM_ACTIVITIES;
  };

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    const baseList = getBaseActivities(selectedDiff);

    let shuffled = [...baseList].sort(() => Math.random() - 0.5);
    while (shuffled.every((item, idx) => item.correctOrder === idx + 1) && shuffled.length > 1) {
      shuffled = [...baseList].sort(() => Math.random() - 0.5);
    }

    setCurrentList(shuffled);
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
      speak(t('routineInstructions'), true);
    }
  };

  useEffect(() => {
    startNewGame(difficulty);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [difficulty]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!isGameActive || feedback !== null) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentList.length) return;

    const updated = [...currentList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setCurrentList(updated);
  };

  const handleCheckOrder = () => {
    if (!isGameActive || feedback !== null) return;

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const isCorrect = currentList.every((item, idx) => item.correctOrder === idx + 1);

    if (isCorrect) {
      setCorrectAnswers(1);
      setFeedback({ isCorrect: true, text: `${t('correctAnswer')} 🎉` });

      if (voiceEnabled) {
        speak(t('correctAnswer'), true);
      }

      setTimeout(() => {
        handleGameCompletion(1, incorrectAnswers);
      }, 1200);
    } else {
      const nextIncorrect = incorrectAnswers + 1;
      setIncorrectAnswers(nextIncorrect);
      setFeedback({ isCorrect: false, text: t('tryAgain') });

      if (voiceEnabled) {
        speak(t('tryAgain'), true);
      }

      setTimeout(() => {
        setFeedback(null);
      }, 1500);
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

    const calculated = calculateRoutineRecallScore({
      difficulty,
      totalQuestions: 1,
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
        gameType: 'daily_routine_recall',
        difficulty: calculated.difficulty,
        totalPairs: getBaseActivities(difficulty).length,
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
      console.warn('[SAVE ROUTINE GAME FAILED]', err);
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
              📅 {t('routineGameTitle')}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '600' }}>
              {t('routineInstructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak(t('routineInstructions'), true)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px', color: '#A5B4FC', border: '1px solid #6366F1' }}
          title={t('listenInstructions')}
          aria-label={t('listenInstructions')}
        >
          <Volume2 size={18} /> {t('listenInstructions')}
        </button>
      </div>

      {/* Main Routine Display */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', margin: 0 }}>
          {t('routineInstructions')}
        </p>

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#6EE7B7' : '#FDA4AF',
              padding: '12px 20px',
              borderRadius: '14px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: feedback.isCorrect ? '2px solid #10B981' : '2px solid #F43F5E',
              textAlign: 'center',
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* Activity Re-ordering List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentList.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '3px solid var(--border-glass-bright)',
                borderRadius: '18px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(236, 72, 153, 0.2)',
                    border: '2px solid #EC4899',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#F472B6',
                  }}
                >
                  {index + 1}
                </span>

                <span style={{ fontSize: '38px', lineHeight: 1 }}>{item.emoji}</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                  {t(item.nameKey as any)}
                </span>
              </div>

              {/* Move Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '46px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    opacity: index === 0 ? 0.4 : 1,
                  }}
                  title="Move Up"
                >
                  <ArrowUp size={22} />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === currentList.length - 1 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '46px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    opacity: index === currentList.length - 1 ? 0.4 : 1,
                  }}
                  title="Move Down"
                >
                  <ArrowDown size={22} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Order Action Button */}
        <div style={{ display: 'flex', gap: '14px', marginTop: '12px' }}>
          <button
            type="button"
            onClick={handleCheckOrder}
            disabled={!isGameActive || feedback !== null}
            className="btn-primary btn-emerald"
            style={{ flex: 1, minHeight: '54px', fontSize: '18px', borderRadius: '16px' }}
          >
            <CheckCircle2 size={22} /> {t('startGame')}
          </button>

          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '54px', padding: '0 24px', fontSize: '16px', borderRadius: '16px' }}
          >
            <RotateCcw size={18} /> {t('startGame')}
          </button>
        </div>
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
