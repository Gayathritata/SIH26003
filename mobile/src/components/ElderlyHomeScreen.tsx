import React from 'react';
import { Brain, Bell, BarChart2, Mic, Settings, Play, Sparkles, User } from 'lucide-react';
import { getTranslation, Language } from '../i18n/translations';
import { UserProfile } from '../services/authService';

interface Props {
  user: UserProfile | null;
  lang: Language;
  difficulty: number;
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
  onNavigate: (screen: 'games' | 'reminders' | 'my_progress' | 'profile' | 'settings') => void;
  onTriggerVoice: () => void;
}

export const ElderlyHomeScreen: React.FC<Props> = ({
  user,
  lang,
  difficulty,
  selectedMood,
  onSelectMood,
  onNavigate,
  onTriggerVoice,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const moodOptions = [
    { key: 'happy', labelKey: 'moodHappy' as const },
    { key: 'good', labelKey: 'moodGood' as const },
    { key: 'okay', labelKey: 'moodOkay' as const },
    { key: 'worried', labelKey: 'moodWorried' as const },
    { key: 'sad', labelKey: 'moodSad' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Hero Welcome Card */}
      <section className="hero-card" aria-label="Welcome banner">
        <div>
          <span style={{ fontSize: '16px', color: '#6EE7B7', fontWeight: '600' }}>
            {t('goodMorning')}
          </span>
          <h2 className="text-hero-title" style={{ marginTop: '4px' }}>
            {user?.name ? `${t('helloUser')}, ${user.name.split(' ')[0]}` : t('helloUser')}
          </h2>
          <p className="text-body-elderly" style={{ marginTop: '6px', color: '#CBD5E1' }}>
            {t('aiRecommended')}: <strong>Level {difficulty}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <span className="badge-pill badge-emerald" style={{ fontSize: '14px', padding: '8px 16px' }}>
            <Sparkles size={18} /> Level {difficulty}
          </span>
          <button
            onClick={() => onNavigate('profile')}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '44px', padding: '0 16px', fontSize: '15px' }}
            aria-label="View Profile"
          >
            <User size={18} color="#10B981" />
            {t('profileTitle')}
          </button>
        </div>
      </section>

      {/* Mood Check-in Card */}
      <section className="glass-panel" style={{ padding: '24px' }} aria-label="Mood Check-in">
        <h3 className="text-card-title" style={{ marginBottom: '16px' }}>
          {t('moodCheckinTitle')}
        </h3>
        <div className="mood-chip-group" role="radiogroup" aria-label="Mood options">
          {moodOptions.map((m) => (
            <button
              key={m.key}
              onClick={() => onSelectMood(m.key)}
              className={`mood-chip ${selectedMood === m.key ? 'active' : ''}`}
              role="radio"
              aria-checked={selectedMood === m.key}
              style={{ minHeight: '48px', padding: '12px 20px' }}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* Elderly Navigation Cards (5 Large Dashboard Targets) */}
      <section aria-label="Elderly Navigation Options">
        <h3 className="text-section-title" style={{ marginBottom: '18px' }}>
          {t('todaysActivities')}
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Card 1: 🧠 Cognitive Games */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={() => onNavigate('games')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              border: '2px solid rgba(16, 185, 129, 0.3)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Cognitive Games"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Brain size={32} color="#10B981" />
              </div>
              <h4 className="text-card-title">{t('cognitiveGames')}</h4>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
                {t('memoryGameDesc')}
              </p>
            </div>
            <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px' }}>
              <Play size={20} /> {t('startActivity')}
            </button>
          </div>

          {/* Card 2: 💊 Reminders */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={() => onNavigate('reminders')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              border: '2px solid rgba(245, 158, 11, 0.3)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Reminders"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Bell size={32} color="#F59E0B" />
              </div>
              <h4 className="text-card-title">{t('remindersCard')}</h4>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
                {t('remindersTitle')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #F59E0B', color: '#FCD34D' }}>
              <Bell size={20} /> {t('remindersCard')}
            </button>
          </div>

          {/* Card 3: 📊 My Progress */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={() => onNavigate('my_progress')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              border: '2px solid rgba(99, 102, 241, 0.3)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to My Progress"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(99, 102, 241, 0.2)', border: '1px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BarChart2 size={32} color="#6366F1" />
              </div>
              <h4 className="text-card-title">{t('myProgress')}</h4>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
                {t('comingSoonMessage')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #6366F1', color: '#A5B4FC' }}>
              <BarChart2 size={20} /> {t('myProgress')}
            </button>
          </div>

          {/* Card 4: 🗣️ Voice Assistance */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={onTriggerVoice}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              border: '2px solid rgba(20, 184, 166, 0.3)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Activate Voice Assistance"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(20, 184, 166, 0.2)', border: '1px solid #14B8A6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Mic size={32} color="#14B8A6" />
              </div>
              <h4 className="text-card-title">{t('voiceAssistance')}</h4>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
                {t('voicePrompt')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #14B8A6', color: '#5EEAD4' }}>
              <Mic size={20} /> {t('voiceAssistance')}
            </button>
          </div>

          {/* Card 5: ⚙️ Settings */}
          <div
            className="glass-panel glass-panel-hover"
            onClick={() => onNavigate('settings')}
            style={{
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              border: '2px solid rgba(139, 92, 246, 0.3)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Settings"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.2)', border: '1px solid #8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Settings size={32} color="#8B5CF6" />
              </div>
              <h4 className="text-card-title">{t('settingsCard')}</h4>
              <p style={{ fontSize: '15px', color: '#94A3B8', marginTop: '6px' }}>
                {t('settingsTitle')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #8B5CF6', color: '#C4B5FD' }}>
              <Settings size={20} /> {t('settingsCard')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
