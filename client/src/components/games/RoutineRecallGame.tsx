import React, { useState, useEffect, useRef } from 'react';
import { Calendar, RotateCcw, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateRoutineRecallScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameHeader } from './common/GameHeader';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { Language } from '../../utils/i18n';

export interface RoutineActivity {
  id: string;
  name: string;
  emoji: string;
  correctOrder: number; // 1-indexed correct chronological order
}

const EASY_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', name: 'Wake up', emoji: '🌅', correctOrder: 1 },
  { id: 'breakfast', name: 'Have breakfast', emoji: '🥣', correctOrder: 2 },
  { id: 'sleep', name: 'Go to sleep', emoji: '🌙', correctOrder: 3 },
];

const MEDIUM_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', name: 'Wake up', emoji: '🌅', correctOrder: 1 },
  { id: 'teeth', name: 'Brush teeth', emoji: '🪥', correctOrder: 2 },
  { id: 'breakfast', name: 'Have breakfast', emoji: '🥣', correctOrder: 3 },
  { id: 'medicine', name: 'Take medicine', emoji: '💊', correctOrder: 4 },
  { id: 'sleep', name: 'Go to sleep', emoji: '🌙', correctOrder: 5 },
];

const HARD_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', name: 'Wake up', emoji: '🌅', correctOrder: 1 },
  { id: 'teeth', name: 'Brush teeth', emoji: '🪥', correctOrder: 2 },
  { id: 'breakfast', name: 'Have breakfast', emoji: '🥣', correctOrder: 3 },
  { id: 'medicine', name: 'Take medicine', emoji: '💊', correctOrder: 4 },
  { id: 'walk', name: 'Take a walk', emoji: '🚶', correctOrder: 5 },
  { id: 'read', name: 'Read a book', emoji: '📖', correctOrder: 6 },
  { id: 'sleep', name: 'Go to sleep', emoji: '🌙', correctOrder: 7 },
];

interface RoutineRecallGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  lang?: Language | string;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const RoutineRecallGame: React.FC<RoutineRecallGameProps> = ({
  difficulty: propDiff,
  initialDifficulty = 1,
  lang = 'en',
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const [difficulty, setDifficulty] = useState<number>(propDiff || initialDifficulty);
  const [currentList, setCurrentList] = useState<RoutineActivity[]>([]);

  // Performance tracking
  const [attempts, setAttempts] = useState<number>(0);
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

  const getBaseActivities = (diff: number) => {
    if (diff === 1) return EASY_ACTIVITIES;
    if (diff === 2) return MEDIUM_ACTIVITIES;
    return HARD_ACTIVITIES;
  };

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    const baseList = getBaseActivities(selectedDiff);

    // Shuffle list guaranteed not to be in correct order initially
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
  };

  useEffect(() => {
    startNewGame(difficulty);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [difficulty]);

  // Swap item positions up or down
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

  // Submit and verify chronological order
  const handleCheckOrder = () => {
    if (!isGameActive || feedback !== null) return;

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const isCorrect = currentList.every((item, idx) => item.correctOrder === idx + 1);

    if (isCorrect) {
      setCorrectAnswers(1);
      setFeedback({ isCorrect: true, text: 'Correct! 🎉 Excellent routine recall!' });

      setTimeout(() => {
        handleGameCompletion(1, incorrectAnswers);
      }, 1200);
    } else {
      const nextIncorrect = incorrectAnswers + 1;
      setIncorrectAnswers(nextIncorrect);
      setFeedback({ isCorrect: false, text: 'Try again. Some steps are out of order.' });

      setTimeout(() => {
        setFeedback(null);
      }, 1500);
    }
  };

  const handleGameCompletion = async (finalCorrect: number, finalIncorrect: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setIsGameActive(false);
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
      <GameHeader
        title="📅 Daily Routine Recall"
        subtitle="Arrange the daily activities in the correct order from morning to night."
        icon={<Calendar size={30} color="#6366F1" />}
        difficulty={difficulty}
        elapsedSeconds={elapsedSeconds}
        attemptsCount={attempts}
        onNavigateBack={onNavigateBack}
        onChangeDifficulty={(d) => startNewGame(d)}
      />

      {/* Main Routine Display Container */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center', margin: 0 }}>
          Use the ▲ and ▼ buttons to move activities into the correct order (First to Last):
        </p>

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#10B981' : '#F43F5E',
              padding: '12px 20px',
              borderRadius: '14px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
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
                border: '2px solid var(--border-glass-bright)',
                borderRadius: '18px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              {/* Order Number & Activity Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    border: '1px solid #6366F1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#A5B4FC',
                  }}
                >
                  {index + 1}
                </span>

                <span style={{ fontSize: '38px', lineHeight: 1 }}>{item.emoji}</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{item.name}</span>
              </div>

              {/* Move Controls */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    opacity: index === 0 ? 0.4 : 1,
                  }}
                  title="Move Up"
                >
                  <ArrowUp size={20} />
                </button>

                <button
                  type="button"
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === currentList.length - 1 || !isGameActive}
                  className="btn-primary btn-glass-subtle"
                  style={{
                    minHeight: '44px',
                    padding: '0 12px',
                    borderRadius: '12px',
                    opacity: index === currentList.length - 1 ? 0.4 : 1,
                  }}
                  title="Move Down"
                >
                  <ArrowDown size={20} />
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
            <CheckCircle2 size={22} /> Check Order
          </button>

          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '54px', padding: '0 24px', fontSize: '16px', borderRadius: '16px' }}
          >
            <RotateCcw size={18} /> Reset
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
