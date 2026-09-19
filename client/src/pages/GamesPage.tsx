import React from 'react';
import { ArrowLeft, Brain, Target, Calendar, Search, Play } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

interface GamesPageProps {
  difficulty: number;
  onNavigate: (path: string) => void;
  onStartGame: (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ difficulty, onNavigate, onStartGame }) => {
  const { t } = useAccessibility();

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
        <h2 className="text-section-title">{t('cognitiveGames')}</h2>
        <span className="badge-pill badge-emerald">Difficulty Level {difficulty}</span>
      </div>

      <div className="activities-grid">
        {/* Game 1: 🧠 Memory Match */}
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
            <h3 className="text-card-title" style={{ fontSize: '22px' }}>🧠 {t('memoryGameTitle')}</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
              {t('memoryGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '50px', marginTop: '16px', fontSize: '17px' }}>
            <Play size={20} /> {t('startGame')}
          </button>
        </div>

        {/* Game 2: 🔷 Pattern Recognition */}
        <div
          className="glass-panel glass-panel-hover"
          onClick={() => onStartGame('pattern')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '2px solid rgba(245, 158, 11, 0.5)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              }}
            >
              <Target size={30} color="#FFFFFF" />
            </div>
            <h3 className="text-card-title" style={{ fontSize: '22px' }}>🔷 {t('patternGameTitle')}</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
              {t('patternGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '50px', marginTop: '16px', fontSize: '17px' }}>
            <Play size={20} /> {t('startGame')}
          </button>
        </div>

        {/* Game 3: 📅 Daily Routine Recall */}
        <div
          className="glass-panel glass-panel-hover"
          onClick={() => onStartGame('routine')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '2px solid rgba(99, 102, 241, 0.5)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #6366F1, #4338CA)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              }}
            >
              <Calendar size={30} color="#FFFFFF" />
            </div>
            <h3 className="text-card-title" style={{ fontSize: '22px' }}>📅 {t('routineGameTitle')}</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
              {t('routineGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '50px', marginTop: '16px', fontSize: '17px' }}>
            <Play size={20} /> {t('startGame')}
          </button>
        </div>

        {/* Game 4: 👀 Object Recognition */}
        <div
          className="glass-panel glass-panel-hover"
          onClick={() => onStartGame('object_rec')}
          style={{
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '230px',
            border: '2px solid rgba(20, 184, 166, 0.5)',
          }}
        >
          <div>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #14B8A6, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.4)',
              }}
            >
              <Search size={30} color="#FFFFFF" />
            </div>
            <h3 className="text-card-title" style={{ fontSize: '22px' }}>👀 {t('objectGameTitle')}</h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginTop: '6px', fontWeight: '500' }}>
              {t('objectGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '50px', marginTop: '16px', fontSize: '17px' }}>
            <Play size={20} /> {t('startGame')}
          </button>
        </div>
      </div>
    </div>
  );
};
