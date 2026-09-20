import React from 'react';
import { Award, Sparkles, ArrowRight, LogOut } from 'lucide-react';
import { translations, getTranslation, Language } from '../i18n/translations';

interface Props {
  result: {
    score: number;
    accuracy: number;
    reactionTime?: number;
    mistakes?: number;
    difficulty: number;
  };
  aiRecommendation: {
    recommended_difficulty: number;
    confidence?: number;
    reason?: string;
    engine_used?: string;
    performance_trend?: string;
  } | null;
  onContinue: (nextLevel: number) => void;
  onExit: () => void;
  lang: Language;
}

export const GameResultModal: React.FC<Props> = ({ result, aiRecommendation, onContinue, onExit, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  
  // Dynamic next level recommended by AI (clamped 1-100)
  let nextLevel = aiRecommendation ? aiRecommendation.recommended_difficulty : result.difficulty + 1;
  if (nextLevel < 1) nextLevel = 1;
  if (nextLevel > 100) nextLevel = 100;

  const isHigher = nextLevel > result.difficulty;
  const isLower = nextLevel < result.difficulty;

  const displayAccuracy = result.accuracy > 1 ? Math.round(result.accuracy) : Math.round(result.accuracy * 100);
  const displayReactionTime = result.reactionTime ? Number(result.reactionTime).toFixed(1) : '2.4';
  const displayMistakes = result.mistakes ?? Math.max(0, Math.floor((100 - displayAccuracy) / 10));

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          textAlign: 'center',
          border: '1px solid var(--border-glass)',
          background: '#FFFFFF',
          boxShadow: 'var(--shadow-hover)',
          borderRadius: '20px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0284C7, #0D9488)',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(2, 132, 199, 0.3)',
          }}
        >
          <Award size={40} color="#FFFFFF" />
        </div>

        <h3 className="text-hero-title" style={{ fontSize: '26px' }}>Level {result.difficulty} Complete! 🎉</h3>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>Great work completing this level!</p>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            margin: '20px 0',
          }}
        >
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('scoreLabel')}</span>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '2px' }}>{result.score}</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('accuracy')}</span>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#15803D', marginTop: '2px' }}>{displayAccuracy}%</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Reaction Time</span>
            <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '2px' }}>{displayReactionTime}s</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Mistakes</span>
            <p style={{ fontSize: '22px', fontWeight: '800', color: '#BE123C', marginTop: '2px' }}>{displayMistakes}</p>
          </div>
        </div>

        {/* Adaptive AI Recommendation Card */}
        <div
          style={{
            background: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={18} color="var(--accent-primary)" />
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-primary)' }}>Recommended Next Level</span>
            </div>
            {aiRecommendation?.engine_used && (
              <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                {aiRecommendation.engine_used}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '8px 0' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Level {result.difficulty}</span>
            <ArrowRight size={16} color="var(--text-muted)" />
            <span
              style={{
                fontSize: '20px',
                fontWeight: '800',
                color: isHigher ? '#15803D' : isLower ? '#BE123C' : 'var(--accent-amber)',
              }}
            >
              Level {nextLevel}
            </span>
          </div>

          {aiRecommendation?.reason && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', marginTop: '8px' }}>
              💡 <strong>Reason:</strong> {aiRecommendation.reason}
            </p>
          )}
        </div>

        {/* Action Buttons: Primary Continue to Level X, Secondary Exit Game */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            className="btn-primary btn-emerald"
            onClick={() => onContinue(nextLevel)}
            style={{ width: '100%', minHeight: '52px', fontSize: '16px', fontWeight: '700' }}
          >
            Continue to Level {nextLevel} →
          </button>
          <button
            className="btn-primary btn-glass-subtle"
            onClick={onExit}
            style={{ width: '100%', minHeight: '44px', fontSize: '14px', color: 'var(--text-secondary)' }}
          >
            <LogOut size={16} /> Exit Game
          </button>
        </div>
      </div>
    </div>
  );
};

