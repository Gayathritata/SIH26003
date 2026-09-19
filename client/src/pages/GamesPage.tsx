import React from 'react';
import { ArrowLeft, Brain, Target, Calendar, Search, Play } from 'lucide-react';
import { getTranslation, Language } from '../utils/i18n';

interface GamesPageProps {
  lang: Language;
  difficulty: number;
  onNavigate: (path: string) => void;
  onStartGame: (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ lang, difficulty, onNavigate, onStartGame }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}
        >
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">Cognitive Games</h2>
        <span className="badge-pill badge-emerald">Difficulty Level {difficulty}</span>
      </div>

      <div className="activities-grid">
        {/* Active Game: 🧠 Memory Match */}
        <div
          className="glass-panel glass-panel-hover"
          onClick={() => onStartGame('memory')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '2px solid rgba(236, 72, 153, 0.5)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
              }}
            >
              <Brain size={30} color="#FFFFFF" />
            </div>
            <h3 className="text-card-title" style={{ fontSize: '22px' }}>🧠 Memory Match</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
              Match the same objects and exercise your memory.
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '50px', marginTop: '16px', fontSize: '17px' }}>
            <Play size={20} /> Start Game
          </button>
        </div>

        {/* Future Game 1: Pattern Recognition — Coming Soon */}
        <div
          className="glass-panel"
          style={{
            opacity: 0.75,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Target size={30} color="#F59E0B" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="text-card-title" style={{ fontSize: '20px' }}>Pattern Recognition</h3>
              <span className="badge-pill badge-amber" style={{ fontSize: '11px', padding: '4px 8px' }}>Coming Soon</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Identify visual sequence patterns and shapes.
            </p>
          </div>
          <button disabled className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', opacity: 0.6, cursor: 'not-allowed', fontSize: '15px' }}>
            Coming Soon
          </button>
        </div>

        {/* Future Game 2: Daily Routine Recall — Coming Soon */}
        <div
          className="glass-panel"
          style={{
            opacity: 0.75,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid #6366F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Calendar size={30} color="#6366F1" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="text-card-title" style={{ fontSize: '20px' }}>Daily Routine Recall</h3>
              <span className="badge-pill badge-amber" style={{ fontSize: '11px', padding: '4px 8px' }}>Coming Soon</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Order daily morning and evening activities correctly.
            </p>
          </div>
          <button disabled className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', opacity: 0.6, cursor: 'not-allowed', fontSize: '15px' }}>
            Coming Soon
          </button>
        </div>

        {/* Future Game 3: Object Recognition — Coming Soon */}
        <div
          className="glass-panel"
          style={{
            opacity: 0.75,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'rgba(20, 184, 166, 0.15)',
                border: '1px solid #14B8A6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Search size={30} color="#14B8A6" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 className="text-card-title" style={{ fontSize: '20px' }}>Object Recognition</h3>
              <span className="badge-pill badge-amber" style={{ fontSize: '11px', padding: '4px 8px' }}>Coming Soon</span>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Recognize everyday objects from pictures and names.
            </p>
          </div>
          <button disabled className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', opacity: 0.6, cursor: 'not-allowed', fontSize: '15px' }}>
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};
