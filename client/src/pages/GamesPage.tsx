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
        <h2 className="text-section-title">{t('cognitiveGames')}</h2>
        <span className="badge-pill badge-emerald">Level {difficulty}</span>
      </div>

      <div className="activities-grid">
        <div className="glass-panel glass-panel-hover" onClick={() => onStartGame('memory')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Brain size={28} color="#10B981" />
            </div>
            <h4 className="text-card-title">{t('memoryGameTitle')}</h4>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('memoryGameDesc')}</p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px' }}>
            <Play size={18} /> {t('startActivity')}
          </button>
        </div>

        <div className="glass-panel glass-panel-hover" onClick={() => onStartGame('pattern')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Target size={28} color="#F59E0B" />
            </div>
            <h4 className="text-card-title">{t('patternGameTitle')}</h4>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('patternGameDesc')}</p>
          </div>
          <button className="btn-primary btn-amber" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px' }}>
            <Play size={18} /> {t('startActivity')}
          </button>
        </div>

        <div className="glass-panel glass-panel-hover" onClick={() => onStartGame('routine')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Calendar size={28} color="#6366F1" />
            </div>
            <h4 className="text-card-title">{t('routineGameTitle')}</h4>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('routineGameDesc')}</p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}>
            <Play size={18} /> {t('startActivity')}
          </button>
        </div>

        <div className="glass-panel glass-panel-hover" onClick={() => onStartGame('object_rec')} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '210px' }}>
          <div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(20, 184, 166, 0.15)', border: '1px solid #14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Search size={28} color="#14B8A6" />
            </div>
            <h4 className="text-card-title">{t('objectGameTitle')}</h4>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>{t('objectGameDesc')}</p>
          </div>
          <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', background: 'linear-gradient(135deg, #14B8A6, #0D9488)' }}>
            <Play size={18} /> {t('startActivity')}
          </button>
        </div>
      </div>
    </div>
  );
};
