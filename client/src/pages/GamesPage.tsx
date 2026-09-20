import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Target, Calendar, Search, Play, Trophy } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { fetchPatientMyProfileApi } from '../services/api';

interface GamesPageProps {
  difficulty: number;
  onNavigate: (path: string) => void;
  onStartGame: (gameType: 'memory' | 'pattern' | 'routine' | 'object_rec') => void;
}

export const GamesPage: React.FC<GamesPageProps> = ({ difficulty, onNavigate, onStartGame }) => {
  const { t } = useAccessibility();
  const [gameLevels, setGameLevels] = useState<{
    memory_match: number;
    pattern_recognition: number;
    daily_routine_recall: number;
    object_recognition: number;
  }>({
    memory_match: 1,
    pattern_recognition: 1,
    daily_routine_recall: 1,
    object_recognition: 1,
  });

  useEffect(() => {
    fetchPatientMyProfileApi()
      .then((res) => {
        if (res && res.gameLevels) {
          setGameLevels(res.gameLevels);
        }
      })
      .catch((err) => console.warn('[GAMES PAGE PROFILE FETCH]', err));
  }, []);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 16px', fontSize: '15px' }}
        >
          <ArrowLeft size={18} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">{t('cognitiveGames')}</h2>
        <span className="badge-pill badge-emerald">Persistent Progress Sync</span>
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
            border: '1px solid #BAE6FD',
            background: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
                }}
              >
                <Brain size={26} color="#FFFFFF" />
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                <Trophy size={13} /> Level {gameLevels.memory_match || 1}
              </span>
            </div>
            <h3 className="text-card-title" style={{ fontSize: '20px' }}>🧠 {t('memoryGameTitle')}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              {t('memoryGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '46px', marginTop: '16px', fontSize: '15px' }}>
            <Play size={18} /> Continue at Level {gameLevels.memory_match || 1} →
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
            border: '1px solid #FDE68A',
            background: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.2)',
                }}
              >
                <Target size={26} color="#FFFFFF" />
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                <Trophy size={13} /> Level {gameLevels.pattern_recognition || 1}
              </span>
            </div>
            <h3 className="text-card-title" style={{ fontSize: '20px' }}>🔷 {t('patternGameTitle')}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              {t('patternGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '46px', marginTop: '16px', fontSize: '15px' }}>
            <Play size={18} /> Continue at Level {gameLevels.pattern_recognition || 1} →
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
            border: '1px solid #C7D2FE',
            background: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-indigo)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)',
                }}
              >
                <Calendar size={26} color="#FFFFFF" />
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                <Trophy size={13} /> Level {gameLevels.daily_routine_recall || 1}
              </span>
            </div>
            <h3 className="text-card-title" style={{ fontSize: '20px' }}>📅 {t('routineGameTitle')}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              {t('routineGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '46px', marginTop: '16px', fontSize: '15px' }}>
            <Play size={18} /> Continue at Level {gameLevels.daily_routine_recall || 1} →
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
            border: '1px solid #99F6E4',
            background: '#FFFFFF',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'var(--accent-teal)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(13, 148, 136, 0.2)',
                }}
              >
                <Search size={26} color="#FFFFFF" />
              </div>
              <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '4px 10px', fontWeight: '700' }}>
                <Trophy size={13} /> Level {gameLevels.object_recognition || 1}
              </span>
            </div>
            <h3 className="text-card-title" style={{ fontSize: '20px' }}>👀 {t('objectGameTitle')}</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
              {t('objectGameDesc')}
            </p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '46px', marginTop: '16px', fontSize: '15px' }}>
            <Play size={18} /> Continue at Level {gameLevels.object_recognition || 1} →
          </button>
        </div>
      </div>
    </div>
  );
};
