import React, { useState, useEffect, useRef } from 'react';
import { Calendar, RotateCcw, CheckCircle2, ArrowUp, ArrowDown, Volume2, ArrowLeft } from 'lucide-react';
import { calculateRoutineRecallScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { getRoutineActivitiesForLevel } from '../../utils/levelDifficulty';
import { submitGameSession } from '../../services/api';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { useAccessibility } from '../../context/AccessibilityContext';

export interface RoutineActivity {
  id: string;
  nameKey: string;
  emoji: string;
  correctOrder: number;
}

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

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    const baseList = getRoutineActivitiesForLevel(selectedDiff);

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
    const activeLvl = propDiff || initialDifficulty;
    setDifficulty(activeLvl);
    startNewGame(activeLvl);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [propDiff, initialDifficulty]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!isGameActive) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;

    const newList = [...currentList];
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;
    setCurrentList(newList);
  };

  const handleCheckOrder = () => {
    if (!isGameActive || feedback !== null) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    const isCorrect = currentList.every((item, idx) => item.correctOrder === idx + 1);

    if (isCorrect) {
      const newCorrect = correctAnswers + 1;
      setCorrectAnswers(newCorrect);
      setFeedback({ isCorrect: true, text: t('correctAnswer') });

      if (voiceEnabled) speak(t('correctAnswer'), true);

      setTimeout(() => {
        finishGame(newAttempts, 1, 0);
      }, 1200);
    } else {
      const newIncorrect = incorrectAnswers + 1;
      setIncorrectAnswers(newIncorrect);
      setFeedback({ isCorrect: false, text: t('tryAgain') });

      if (voiceEnabled) speak(t('tryAgain'), true);

      setTimeout(() => {
        setFeedback(null);
      }, 1200);
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

    const calculated = calculateRoutineRecallScore({
      difficulty,
      correctAnswers: finalCorrect,
      incorrectAnswers: finalIncorrect,
      completionTime: finalCompletionTime,
      totalQuestions: currentList.length,
      startedAt: startedAtISO,
      completedAt: completedAtISO,
    });

    setMetrics(calculated);
    setIsGameComplete(true);

    setIsSaving(true);
    try {
      const apiRes = await submitGameSession({
        gameType: 'daily_routine_recall',
        difficulty: calculated.difficulty,
        totalPairs: currentList.length,
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
      if (onFinish) onFinish({ ...calculated, aiRecommendation: apiRes?.aiRecommendation });
    } catch (err) {
      console.warn('[SAVE ROUTINE GAME FAILED]', err);
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
              📅 {t('routineGameTitle')} (Level {difficulty} / 100)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontWeight: '500' }}>
              {t('routineInstructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak(t('routineInstructions'), true)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '40px', padding: '0 12px', fontSize: '13px', color: 'var(--accent-indigo)' }}
          title={t('listenInstructions')}
          aria-label={t('listenInstructions')}
        >
          <Volume2 size={16} /> {t('listenInstructions')}
        </button>
      </div>

      {/* Main Routine Container */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFFFF' }}>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', margin: 0 }}>
          {t('routineInstructions')}
        </p>

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#15803D' : '#BE123C',
              padding: '10px 20px',
              borderRadius: '12px',
              background: feedback.isCorrect ? '#DCFCE7' : '#FFE4E6',
              border: feedback.isCorrect ? '1px solid #86EFAC' : '1px solid #FECDD3',
              textAlign: 'center',
            }}
          >
            {feedback.text}
          </div>
        )}

        {/* Activity Re-ordering List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentList.map((item, index) => (
            <div
              key={item.id}
              style={{
                background: '#F8FAFC',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '12px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'var(--accent-primary-glow)',
                    border: '1px solid var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {index + 1}
                </span>

                <span style={{ fontSize: '34px', lineHeight: 1 }}>{item.emoji}</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {t(item.nameKey as any)}
                </span>
              </div>

              {/* Move Controls */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    opacity: index === 0 ? 0.4 : 1,
                  }}
                  title="Move Up"
                >
                  <ArrowUp size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === currentList.length - 1 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '40px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    opacity: index === currentList.length - 1 ? 0.4 : 1,
                  }}
                  title="Move Down"
                >
                  <ArrowDown size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Order Action Button */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={handleCheckOrder}
            disabled={!isGameActive || feedback !== null}
            className="btn-primary btn-emerald"
            style={{ flex: 1, minHeight: '48px', fontSize: '16px' }}
          >
            <CheckCircle2 size={20} /> Check Sequence
          </button>

          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '48px', padding: '0 20px', fontSize: '15px' }}
          >
            <RotateCcw size={16} /> Restart
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
