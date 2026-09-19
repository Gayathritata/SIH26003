import React, { useState, useEffect, useRef } from 'react';
import { Search, RotateCcw, Mic, Volume2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { calculateObjectRecognitionScore, CalculatedGameMetrics } from '../../utils/gameScoring';
import { submitGameSession } from '../../services/api';
import { GameCompletionScreen } from './common/GameCompletionScreen';
import { useAccessibility } from '../../context/AccessibilityContext';
import { voiceService } from '../../services/voiceService';

interface ObjectQuestion {
  objectName: string;
  emoji: string;
  category: string;
  promptKey: string;
  options: string[];
}

const EASY_QUESTIONS: ObjectQuestion[] = [
  {
    objectName: 'Mango',
    emoji: '🥭',
    category: 'Fresh Fruit',
    promptKey: 'objectInstructions',
    options: ['Mango', 'Apple', 'Cup'],
  },
  {
    objectName: 'Cup',
    emoji: '☕',
    category: 'Kitchenware',
    promptKey: 'objectInstructions',
    options: ['Book', 'Cup', 'Chair'],
  },
  {
    objectName: 'Clock',
    emoji: '⏰',
    category: 'Household Item',
    promptKey: 'objectInstructions',
    options: ['Clock', 'Umbrella', 'Flower'],
  },
];

const MEDIUM_QUESTIONS: ObjectQuestion[] = [
  {
    objectName: 'Book',
    emoji: '📖',
    category: 'Reading Item',
    promptKey: 'objectInstructions',
    options: ['Book', 'Paper', 'Magazine', 'Notebook'],
  },
  {
    objectName: 'Umbrella',
    emoji: '☂️',
    category: 'Weather Gear',
    promptKey: 'objectInstructions',
    options: ['Hat', 'Raincoat', 'Umbrella', 'Towel'],
  },
];

interface ObjectRecognitionGameProps {
  difficulty?: number;
  initialDifficulty?: number;
  onNavigateBack?: () => void;
  onSessionSaved?: () => void;
  onFinish?: (resultData: any) => void;
}

export const ObjectRecognitionGame: React.FC<ObjectRecognitionGameProps> = ({
  difficulty: propDiff,
  initialDifficulty = 1,
  onNavigateBack,
  onSessionSaved,
  onFinish,
}) => {
  const { t, speak, voiceEnabled, lang } = useAccessibility();

  const [difficulty, setDifficulty] = useState<number>(propDiff || initialDifficulty);
  const [questionIndex, setQuestionIndex] = useState<number>(0);

  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const [isListeningSTT, setIsListeningSTT] = useState<boolean>(false);
  const [sttNotice, setSttNotice] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isGameActive, setIsGameActive] = useState<boolean>(false);
  const [isGameComplete, setIsGameComplete] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<CalculatedGameMetrics | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  const questionsList = difficulty === 1 ? EASY_QUESTIONS : MEDIUM_QUESTIONS;
  const currentQuestion = questionsList[questionIndex % questionsList.length];
  const totalQuestions = questionsList.length;

  const startNewGame = (selectedDiff: number = difficulty) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setDifficulty(selectedDiff);
    setQuestionIndex(0);
    setCorrectAnswers(0);
    setIncorrectAnswers(0);
    setFeedback(null);
    setSttNotice(null);
    setElapsedSeconds(0);
    setIsGameComplete(false);
    setMetrics(null);
    setIsGameActive(true);

    startTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    if (voiceEnabled) {
      speak(t('objectInstructions'), true);
    }
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
      setFeedback({ isCorrect: true, text: `${t('correctAnswer')} 🎉 (${currentQuestion.objectName})` });

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

  const handleStartSTT = () => {
    if (!voiceService.isSTTSupported()) {
      setSttNotice(t('voiceInputUnavailable'));
      return;
    }

    setIsListeningSTT(true);
    setSttNotice('Listening... Speak object name.');

    voiceService.listen(
      (transcript) => {
        setIsListeningSTT(false);
        setSttNotice(`Heard: "${transcript}"`);
        
        // Find matching option
        const match = currentQuestion.options.find(
          (opt) => transcript.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(transcript.toLowerCase())
        );
        if (match) {
          handleSelectOption(match);
        } else {
          handleSelectOption(transcript);
        }
      },
      (err) => {
        setIsListeningSTT(false);
        if (err === 'unsupported') {
          setSttNotice(t('voiceInputUnavailable'));
        } else {
          setSttNotice(t('tryAgain'));
        }
      },
      lang
    );
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
              👀 {t('objectGameTitle')}
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '600' }}>
              {t('objectInstructions')}
            </p>
          </div>
        </div>

        <button
          onClick={() => speak(t('objectInstructions'), true)}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px', color: '#5EEAD4', border: '1px solid #14B8A6' }}
          title={t('listenInstructions')}
          aria-label={t('listenInstructions')}
        >
          <Volume2 size={18} /> {t('listenInstructions')}
        </button>
      </div>

      {/* Main Object Visualizer */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        {/* Object Large Icon */}
        <div
          style={{
            width: '130px',
            height: '130px',
            borderRadius: '32px',
            background: 'rgba(20, 184, 166, 0.15)',
            border: '3px solid #14B8A6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '72px',
            boxShadow: '0 0 35px rgba(20, 184, 166, 0.35)',
          }}
        >
          {currentQuestion.emoji}
        </div>

        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
          {t('objectInstructions')}
        </h3>

        {/* Speech Recognition Trigger Button */}
        <button
          onClick={handleStartSTT}
          className={`btn-primary ${isListeningSTT ? 'btn-emerald pulse-mic' : 'btn-glass-subtle'}`}
          style={{
            minHeight: '52px',
            padding: '0 24px',
            fontSize: '16px',
            border: '2px solid #14B8A6',
            color: '#5EEAD4',
          }}
          aria-label={t('listenPrompt')}
        >
          <Mic size={20} /> {isListeningSTT ? t('speaking') : t('listenPrompt')}
        </button>

        {sttNotice && (
          <p style={{ fontSize: '14px', color: '#FCD34D', margin: 0, fontWeight: '600' }}>
            {sttNotice}
          </p>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: feedback.isCorrect ? '#6EE7B7' : '#FDA4AF',
              padding: '12px 24px',
              borderRadius: '16px',
              background: feedback.isCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
              border: feedback.isCorrect ? '2px solid #10B981' : '2px solid #F43F5E',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {feedback.isCorrect ? <CheckCircle2 size={24} /> : null}
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
              minHeight: '80px',
              borderRadius: '22px',
              background: 'rgba(30, 41, 59, 0.95)',
              border: '3px solid var(--border-glass-bright)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '16px',
              fontSize: '22px',
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
