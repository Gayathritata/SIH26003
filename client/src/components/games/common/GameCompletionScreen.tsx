import React from 'react';
import { Trophy, Play } from 'lucide-react';
import { CalculatedGameMetrics } from '../../../utils/gameScoring';

interface GameCompletionScreenProps {
  metrics: CalculatedGameMetrics;
  isSaving?: boolean;
  onPlayAgain: () => void;
  onNavigateBack?: () => void;
}

export const GameCompletionScreen: React.FC<GameCompletionScreenProps> = ({
  metrics,
  isSaving = false,
  onPlayAgain,
  onNavigateBack,
}) => {
  return (
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
        {/* Trophy Icon Header */}
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
            Game Complete 🎉
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px' }}>
            Great cognitive exercise! Session saved to your progress profile.
          </p>
        </div>

        {/* Performance Stats Metrics */}
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
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Score</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#F472B6' }}>{metrics.score}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Accuracy</span>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#6EE7B7' }}>{metrics.accuracy}%</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Time Taken</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#93C5FD' }}>{metrics.completionTime}s</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Incorrect Attempts</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#FCD34D' }}>
              {metrics.incorrectAttempts ?? metrics.incorrectAnswers ?? 0}
            </span>
          </div>
        </div>

        {isSaving && (
          <p style={{ fontSize: '13px', color: '#F472B6', margin: 0, fontWeight: '600' }}>
            Saving session data to server...
          </p>
        )}

        {/* Completion Action Buttons */}
        <div style={{ display: 'flex', gap: '14px' }}>
          <button
            type="button"
            onClick={onPlayAgain}
            className="btn-primary btn-emerald"
            style={{ flex: 1, minHeight: '54px', fontSize: '17px', borderRadius: '16px' }}
          >
            <Play size={20} /> Play Again
          </button>

          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn-primary btn-glass-subtle"
              style={{ flex: 1, minHeight: '54px', fontSize: '17px', borderRadius: '16px' }}
            >
              Back to Games
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
