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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 10, 18, 0.88)',
        backdropFilter: 'blur(20px)',
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
          border: '2px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4)',
          }}
        >
          <Award size={48} color="#FFFFFF" />
        </div>

        <h3 className="text-hero-title" style={{ fontSize: '28px' }}>{t('activityCompleted')}</h3>
        <p style={{ fontSize: '16px', color: '#94A3B8', marginTop: '4px' }}>{t('activityCompletedSub')}</p>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '14px',
            margin: '24px 0',
          }}
        >
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>{t('accuracy')}</span>
            <p style={{ fontSize: '26px', fontWeight: '800', color: '#10B981', marginTop: '2px' }}>{Math.round(result.accuracy * 100)}%</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>{t('reactionSpeed')}</span>
            <p style={{ fontSize: '26px', fontWeight: '800', color: '#F59E0B', marginTop: '2px' }}>{result.reactionTime}s</p>
          </div>
        </div>

        {/* Adaptive AI Recommendation Card */}
        {aiRecommendation && (
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.12))',
              border: '1px solid rgba(99, 102, 241, 0.35)',
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#8B5CF6" />
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#C084FC' }}>AI Adaptive Engine</span>
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '11px' }}>
                {aiRecommendation.engine_used}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 0' }}>
              <span style={{ fontSize: '15px', color: '#94A3B8' }}>Level {result.difficulty}</span>
              <ArrowRight size={18} color="#94A3B8" />
              <span
                style={{
                  fontSize: '22px',
                  fontWeight: '800',
                  color: isHigher ? '#10B981' : isLower ? '#F43F5E' : '#F59E0B',
                }}
              >
                Level {nextLevel}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: '1.5', background: 'rgba(0,0,0,0.25)', padding: '12px 14px', borderRadius: '12px' }}>
              💡 <strong>{t('explainableReason')}:</strong> {aiRecommendation.reason}
            </p>
          </div>
        )}

        <button className="btn-primary btn-emerald" onClick={onNext} style={{ width: '100%' }}>
          {t('nextActivity')} <ArrowRight size={22} />
        </button>
      </div>
    </div>
  );
};
