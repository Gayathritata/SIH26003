import React from 'react';
import { Award, Sparkles, ArrowRight } from 'lucide-react';
import { translations, getTranslation, Language } from '../i18n/translations';

interface Props {
  result: {
    score: number;
    accuracy: number;
    reactionTime: number;
    mistakes: number;
    difficulty: number;
  };
  aiRecommendation: {
    recommended_difficulty: number;
    confidence: number;
    reason: string;
    engine_used: string;
    performance_trend: string;
  } | null;
  onNext: () => void;
  lang: Language;
}

export const GameResultModal: React.FC<Props> = ({ result, aiRecommendation, onNext, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const nextLevel = aiRecommendation ? aiRecommendation.recommended_difficulty : result.difficulty;
  const isHigher = nextLevel > result.difficulty;
  const isLower = nextLevel < result.difficulty;

  const displayAccuracy = result.accuracy > 1 ? Math.round(result.accuracy) : Math.round(result.accuracy * 100);

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
          maxWidth: '460px',
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

        <h3 className="text-hero-title" style={{ fontSize: '26px' }}>{t('activityCompleted')} 🎉</h3>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginTop: '4px' }}>{t('activityCompletedSub')}</p>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            margin: '20px 0',
          }}
        >
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('accuracy')}</span>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#15803D', marginTop: '2px' }}>{displayAccuracy}%</p>
          </div>
          <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>{t('reactionSpeed')}</span>
            <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '2px' }}>{result.reactionTime}s</p>
          </div>
        </div>

        {/* Adaptive AI Recommendation Card */}
        {aiRecommendation && (
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
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--accent-primary)' }}>AI Adaptive Engine</span>
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                {aiRecommendation.engine_used}
              </span>
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

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', background: '#FFFFFF', padding: '10px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              💡 <strong>{t('explainableReason')}:</strong> {aiRecommendation.reason}
            </p>
          </div>
        )}

        <button className="btn-primary btn-emerald" onClick={onNext} style={{ width: '100%', minHeight: '48px', fontSize: '16px' }}>
          {t('nextActivity')} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
