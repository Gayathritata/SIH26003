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

  const calculatePairsForLevel = (lvl: number): number => {
    if (lvl <= 2) return 3;
    if (lvl <= 5) return 4;
    if (lvl <= 10) return 5;
    if (lvl <= 25) return 6;
    if (lvl <= 50) return 7;
    return 8;
  };

  const totalPairs = calculatePairsForLevel(difficulty);

  const initializeGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const pairsCount = calculatePairsForLevel(selectedDiff);
    const selectedObjects = [];
    for (let i = 0; i < pairsCount; i++) {
      selectedObjects.push(FAMILIAR_OBJECTS[i % FAMILIAR_OBJECTS.length]);
    }

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
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. TOP HEADER & SCOREBOARD */}
      <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
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
                🧠 {t('memoryGameTitle')}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: '2px 0 0 0', fontWeight: '500' }}>
                {t('memoryInstructions')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => speak(t('memoryInstructions'), true)}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '40px', padding: '0 12px', fontSize: '13px', color: 'var(--accent-primary)' }}
              title={t('listenInstructions')}
              aria-label={t('listenInstructions')}
            >
              <Volume2 size={16} /> {t('listenInstructions')}
            </button>

            {/* Difficulty Level Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setDifficulty(lvl);
                    initializeGame(lvl);
                  }}
                  className={`btn-primary ${difficulty === lvl ? 'btn-emerald' : 'btn-glass-subtle'}`}
                  style={{ minHeight: '36px', padding: '0 10px', fontSize: '13px', borderRadius: '8px' }}
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            background: '#F8FAFC',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-glass)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={20} color="var(--accent-primary)" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Progress Level</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>
                Level {difficulty} / 100
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} color="var(--accent-emerald)" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('scoreLabel')}</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#15803D' }}>
                {correctMatches} / {totalPairs}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--accent-amber)" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('movesLabel')}</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#B45309' }}>
                {attempts}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-indigo)" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('timeLabel')}</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--accent-indigo)' }}>
                {formatTimer(elapsedSeconds)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CARDS GRID */}
      <div className={`memory-cards-grid-l${difficulty}`}>
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => handleCardClick(card)}
            disabled={card.isFlipped || card.isMatched || isProcessing || !isGameActive}
            className="memory-card-btn"
            style={{
              borderRadius: '16px',
              background: card.isMatched
                ? '#DCFCE7'
                : card.isFlipped
                ? '#E0F2FE'
                : '#FFFFFF',
              border: card.isMatched
                ? '2px solid #86EFAC'
                : card.isFlipped
                ? '2px solid #BAE6FD'
                : '1px solid var(--border-glass)',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: card.isFlipped || card.isMatched ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              padding: '12px',
            }}
            aria-label={card.isFlipped ? card.objectId : 'Card hidden'}
          >
            {card.isFlipped || card.isMatched ? (
              <>
                <span style={{ fontSize: '48px', lineHeight: 1 }}>{card.emoji}</span>
                {card.isMatched && (
                  <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    <CheckCircle2 size={12} /> {t('memoryCardMatched')}
                  </span>
                )}
              </>
            ) : (
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Brain size={28} color="var(--accent-primary)" />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* 3. RESTART ACTION */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => initializeGame(difficulty)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '46px', padding: '0 24px', fontSize: '15px' }}
        >
          <RotateCcw size={18} /> Restart Game
        </button>
      </div>

      {/* 4. GAME COMPLETE OVERLAY */}
      {isGameComplete && gameResultMetrics && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '32px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              textAlign: 'center',
            }}
          >
            <div>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
                }}
              >
                <Trophy size={34} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {t('activityCompleted')} 🎉
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('gameComplete')}
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '14px',
                border: '1px solid var(--border-glass)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('scoreLabel')}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)' }}>{gameResultMetrics.score}</span>
              </div>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>{t('accuracy')}</span>
                <span style={{ fontSize: '24px', fontWeight: '800', color: '#15803D' }}>{gameResultMetrics.accuracy}%</span>
              </div>
            </div>

            {isSaving && (
              <p style={{ fontSize: '12px', color: 'var(--accent-primary)', margin: 0, fontWeight: '600' }}>
                Saving session data...
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => initializeGame(difficulty)}
                className="btn-primary btn-emerald"
                style={{ flex: 1, minHeight: '48px', fontSize: '15px' }}
              >
                <Play size={18} /> Play Again
              </button>

              {onNavigateBack && (
                <button
                  type="button"
                  onClick={onNavigateBack}
                  className="btn-primary btn-glass-subtle"
                  style={{ flex: 1, minHeight: '48px', fontSize: '15px' }}
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
