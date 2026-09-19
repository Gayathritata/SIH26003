import React, { useState, useEffect, useRef } from 'react';
import { Brain, RotateCcw, ArrowLeft, Trophy, Clock, CheckCircle2, Award, Target, Play, Volume2 } from 'lucide-react';
import { calculateMemoryMatchScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export interface ObjectItem {
  id: string;
  nameKey: string;
  emoji: string;
}

const FAMILIAR_OBJECTS: ObjectItem[] = [
  { id: 'mango', nameKey: 'objectGameTitle', emoji: '🥭' },
  { id: 'cup', nameKey: 'objectGameTitle', emoji: '☕' },
  { id: 'book', nameKey: 'objectGameTitle', emoji: '📖' },
  { id: 'flower', nameKey: 'objectGameTitle', emoji: '🌸' },
  { id: 'apple', nameKey: 'objectGameTitle', emoji: '🍎' },
  { id: 'umbrella', nameKey: 'objectGameTitle', emoji: '☂️' },
  { id: 'clock', nameKey: 'objectGameTitle', emoji: '⏰' },
  { id: 'chair', nameKey: 'objectGameTitle', emoji: '🪑' },
];

interface CardState {
  key: string;
  objectId: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  initialDifficulty?: number;
  difficulty?: number;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  initialDifficulty = 1,
  difficulty: propDifficulty,
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const [difficulty, setDifficulty] = useState<number>(propDifficulty || initialDifficulty);
  const [cards, setCards] = useState<CardState[]>([]);
  const [flippedKeys, setFlippedKeys] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Metrics
  const [attempts, setAttempts] = useState<number>(0);
  const [correctMatches, setCorrectMatches] = useState<number>(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState<number>(0);

  // Timer & States
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [gameResultMetrics, setGameResultMetrics] = useState<CalculatedGameMetrics | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const totalPairs = difficulty === 1 ? 3 : difficulty === 2 ? 4 : 6;

  const initializeGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const pairsCount = selectedDiff === 1 ? 3 : selectedDiff === 2 ? 4 : 6;
    const selectedObjects = FAMILIAR_OBJECTS.slice(0, pairsCount);

    const cardDeck: CardState[] = [];
    selectedObjects.forEach((obj, index) => {
      cardDeck.push({
        key: `${obj.id}-pairA-${index}`,
        objectId: obj.id,
        emoji: obj.emoji,
        isFlipped: false,
        isMatched: false,
      });
      cardDeck.push({
        key: `${obj.id}-pairB-${index}`,
        objectId: obj.id,
        emoji: obj.emoji,
        isFlipped: false,
        isMatched: false,
      });
    });

    const shuffledDeck = cardDeck.sort(() => Math.random() - 0.5);

    setCards(shuffledDeck);
    setFlippedKeys([]);
    setIsProcessing(false);
    setAttempts(0);
    setCorrectMatches(0);
    setIncorrectAttempts(0);
    setElapsedSeconds(0);
    setIsGameComplete(false);
    setGameResultMetrics(null);
    setIsGameActive(true);

    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Speak game instructions if voice enabled
    if (voiceEnabled) {
      speak(t('memoryInstructions'), true);
    }
  };

  useEffect(() => {
    initializeGame(difficulty);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [difficulty]);

  const handleCardClick = (card: CardState) => {
    if (!isGameActive || isProcessing || card.isFlipped || card.isMatched) return;

    const nextFlipped = [...flippedKeys, card.key];
    setFlippedKeys(nextFlipped);

    setCards((prevDeck) =>
      prevDeck.map((c) => (c.key === card.key ? { ...c, isFlipped: true } : c))
    );

    if (nextFlipped.length === 2) {
      setIsProcessing(true);
      const firstCard = cards.find((c) => c.key === nextFlipped[0]);
      const secondCard = card;

      const currentAttempts = attempts + 1;
      setAttempts(currentAttempts);

      if (firstCard && firstCard.objectId === secondCard.objectId) {
        // MATCH
        const newCorrectCount = correctMatches + 1;
        setCorrectMatches(newCorrectCount);

        setCards((prevDeck) =>
          prevDeck.map((c) =>
            c.key === firstCard.key || c.key === secondCard.key
              ? { ...c, isFlipped: true, isMatched: true }
              : c
          )
        );
        setFlippedKeys([]);
        setIsProcessing(false);

        if (voiceEnabled) {
          speak(t('correctAnswer'), true);
        }

        if (newCorrectCount === totalPairs) {
          handleGameCompletion(currentAttempts, newCorrectCount, incorrectAttempts);
        }
      } else {
        // MISMATCH
        const newIncorrectCount = incorrectAttempts + 1;
        setIncorrectAttempts(newIncorrectCount);

        if (voiceEnabled) {
          speak(t('tryAgain'), true);
        }

        setTimeout(() => {
          setCards((prevDeck) =>
            prevDeck.map((c) =>
              c.key === firstCard?.key || c.key === secondCard.key
                ? { ...c, isFlipped: false }
                : c
            )
          );
          setFlippedKeys([]);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const handleGameCompletion = async (
    finalAttempts: number,
    finalCorrect: number,
    finalIncorrect: number
  ) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const completedAtISO = new Date().toISOString();
    const startedAtISO = new Date(startTimeRef.current).toISOString();
    const finalCompletionTime = Math.max(1, elapsedSeconds);

    setIsGameActive(false);

    if (voiceEnabled) {
      speak(t('gameComplete'), true);
    }

    const metrics = calculateMemoryMatchScore({
      difficulty,
      attempts: finalAttempts,
      correctMatches: finalCorrect,
      incorrectAttempts: finalIncorrect,
      completionTime: finalCompletionTime,
      startedAt: startedAtISO,
      completedAt: completedAtISO,
    });

    setGameResultMetrics(metrics);
    setIsGameComplete(true);

    setIsSaving(true);
    try {
      await submitGameSession({
        gameType: 'memory_match',
        difficulty: metrics.difficulty,
        totalPairs: metrics.totalPairs,
        attempts: metrics.attempts,
        correctMatches: metrics.correctMatches,
        incorrectAttempts: metrics.incorrectAttempts,
        accuracy: metrics.accuracy,
        completionTime: metrics.completionTime,
        completionRate: metrics.completionRate,
        score: metrics.score,
        startedAt: metrics.startedAt,
        completedAt: metrics.completedAt,
      });
      if (onSessionSaved) onSessionSaved();
      if (onFinish) onFinish(metrics);
    } catch (e) {
      console.warn('[SAVE GAME SESSION FAILED]', e);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. TOP HEADER & DIFFICULTY SELECTOR */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
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
                🧠 {t('memoryGameTitle')}
              </h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '600' }}>
                {t('memoryInstructions')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => speak(t('memoryInstructions'), true)}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px', color: '#F472B6', border: '1px solid #EC4899' }}
              title={t('listenInstructions')}
              aria-label={t('listenInstructions')}
            >
              <Volume2 size={18} /> {t('listenInstructions')}
            </button>

            {/* Difficulty Level Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '6px', borderRadius: '16px' }}>
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setDifficulty(lvl);
                    initializeGame(lvl);
                  }}
                  className={`btn-primary ${difficulty === lvl ? 'btn-emerald' : 'btn-glass-subtle'}`}
                  style={{ minHeight: '42px', padding: '0 12px', fontSize: '14px', borderRadius: '12px' }}
                >
                  L{lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Scoreboard */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderRadius: '16px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={22} color="#EC4899" />
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Level</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>
                Level {difficulty}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={22} color="#10B981" />
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('scoreLabel')}</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#6EE7B7' }}>
                {correctMatches} / {totalPairs}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={22} color="#F59E0B" />
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('movesLabel')}</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#FCD34D' }}>
                {attempts}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock size={22} color="#3B82F6" />
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('timeLabel')}</span>
              <span style={{ fontSize: '16px', fontWeight: '800', color: '#93C5FD' }}>
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN CARDS GRID */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: difficulty === 1 ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
          gap: '20px',
        }}
      >
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleCardClick(card)}
            disabled={card.isFlipped || card.isMatched || isProcessing || !isGameActive}
            className="glass-panel-hover"
            style={{
              minHeight: '160px',
              borderRadius: '24px',
              background: card.isMatched
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(5, 150, 105, 0.45))'
                : card.isFlipped
                ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.35), rgba(168, 85, 247, 0.45))'
                : 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95))',
              border: card.isMatched
                ? '3px solid #10B981'
                : card.isFlipped
                ? '3px solid #EC4899'
                : '2px solid var(--border-glass-bright)',
              boxShadow: card.isFlipped || card.isMatched ? '0 0 24px rgba(236, 72, 153, 0.4)' : '0 10px 30px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: card.isFlipped || card.isMatched ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              padding: '16px',
            }}
            aria-label={card.isFlipped ? card.objectId : 'Card hidden'}
          >
            {card.isFlipped || card.isMatched ? (
              <>
                <span style={{ fontSize: '56px', lineHeight: 1 }}>{card.emoji}</span>
                {card.isMatched && (
                  <span className="badge-pill badge-emerald" style={{ fontSize: '13px' }}>
                    <CheckCircle2 size={14} /> {t('memoryCardMatched')}
                  </span>
                )}
              </>
            ) : (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Brain size={32} color="#D8B4FE" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 3. RESTART ACTION BAR */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => initializeGame(difficulty)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '52px', padding: '0 32px', fontSize: '17px', borderRadius: '16px' }}
        >
          <RotateCcw size={20} /> {t('startGame')}
        </button>
      </div>

      {/* 4. GAME COMPLETE OVERLAY MODAL */}
      {isGameComplete && gameResultMetrics && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(3, 7, 18, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '36px',
              borderRadius: '28px',
              border: '2px solid rgba(236, 72, 153, 0.5)',
              background: 'linear-gradient(135deg, rgba(27, 15, 39, 0.98), rgba(15, 23, 42, 0.98))',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.9)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              textAlign: 'center',
            }}
          >
            <div>
              <div
                style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  boxShadow: '0 0 35px rgba(236, 72, 153, 0.55)',
                }}
              >
                <Trophy size={42} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                {t('activityCompleted')} 🎉
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                {t('gameComplete')}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '20px',
                borderRadius: '20px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('scoreLabel')}</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#F472B6' }}>{gameResultMetrics.score}</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('accuracy')}</span>
                <span style={{ fontSize: '28px', fontWeight: '800', color: '#6EE7B7' }}>{gameResultMetrics.accuracy}%</span>
              </div>
            </div>

            {isSaving && (
              <p style={{ fontSize: '13px', color: '#F472B6', margin: 0, fontWeight: '600' }}>
                Saving session data...
              </p>
            )}

            <div style={{ display: 'flex', gap: '14px' }}>
              <button
                type="button"
                onClick={() => initializeGame(difficulty)}
                className="btn-primary btn-emerald"
                style={{ flex: 1, minHeight: '54px', fontSize: '17px', borderRadius: '16px' }}
              >
                <Play size={20} /> {t('startGame')}
              </button>

              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="btn-primary btn-glass-subtle"
                  style={{ flex: 1, minHeight: '54px', fontSize: '17px', borderRadius: '16px' }}
                >
                  {t('backToGames')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
