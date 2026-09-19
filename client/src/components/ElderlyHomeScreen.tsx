import React from 'react';
import { Brain, Bell, BarChart2, Mic, Play, Sparkles, User, Volume2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { UserProfile } from '../services/authService';

interface Props {
  user: UserProfile | null;
  difficulty: number;
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
  onNavigate: (screen: 'games' | 'reminders' | 'my_progress' | 'profile' | 'settings') => void;
  onTriggerVoice: () => void;
}

export const ElderlyHomeScreen: React.FC<Props> = ({
  user,
  difficulty,
  selectedMood,
  onSelectMood,
  onNavigate,
  onTriggerVoice,
}) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const moodOptions = [
    { key: 'happy', labelKey: 'moodHappy' as const },
    { key: 'good', labelKey: 'moodGood' as const },
    { key: 'okay', labelKey: 'moodOkay' as const },
    { key: 'worried', labelKey: 'moodWorried' as const },
    { key: 'sad', labelKey: 'moodSad' as const },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Welcome Banner */}
      <section className="hero-card" aria-label="Welcome banner">
        <div>
          <span style={{ fontSize: '15px', color: 'var(--accent-teal)', fontWeight: '700' }}>
            {t('goodMorning')}
          </span>
          <h2 className="text-hero-title" style={{ marginTop: '2px' }}>
            {user?.name ? `${t('helloUser')}, ${user.name.split(' ')[0]}` : t('helloUser')}
          </h2>
          <p className="text-body-elderly" style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
            {t('aiRecommended')}: <strong>Level {difficulty}</strong>
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
          <span className="badge-pill badge-emerald" style={{ fontSize: '13px', padding: '6px 14px' }}>
            <Sparkles size={16} /> Level {difficulty}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {voiceEnabled && (
              <button
                onClick={() => speak(`${t('goodMorning')}. ${t('helloUser')}`)}
                className="btn-primary btn-glass-subtle"
                style={{ minHeight: '40px', padding: '0 12px', borderRadius: '10px' }}
                title={t('listenInstructions')}
                aria-label={t('listenInstructions')}
              >
                <Volume2 size={16} color="var(--accent-primary)" />
              </button>
            )}
            <button
              onClick={() => onNavigate('profile')}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '40px', padding: '0 14px', fontSize: '14px', borderRadius: '10px' }}
              aria-label="View Profile"
            >
              <User size={16} color="var(--accent-teal)" />
              {t('profileTitle')}
            </button>
          </div>
        </div>
      </section>

      {/* Mood Check-in Section */}
      <section className="glass-panel" aria-label="Mood Check-in">
        <h3 className="text-card-title" style={{ marginBottom: '14px' }}>
          {t('moodCheckinTitle')}
        </h3>
        <div className="mood-chip-group" role="radiogroup" aria-label="Mood options">
          {moodOptions.map((m) => (
            <button
              key={m.key}
              onClick={() => {
                onSelectMood(m.key);
                if (voiceEnabled) {
                  speak(t(m.labelKey), true);
                }
              }}
              className={`mood-chip ${selectedMood === m.key ? 'active' : ''}`}
              role="radio"
              aria-checked={selectedMood === m.key}
              style={{ minHeight: '48px', padding: '10px 18px', fontSize: '16px' }}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* Elderly Quick Actions Grid (4 Cards) */}
      <section aria-label="Elderly Navigation Options">
        <h3 className="text-section-title" style={{ marginBottom: '16px' }}>
          {t('todaysActivities')}
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
              minHeight: '210px',
              border: '1px solid #BAE6FD',
              background: '#FFFFFF',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Cognitive Games"
          >
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Brain size={28} color="var(--accent-primary)" />
              </div>
              <h4 className="text-card-title">{t('cognitiveGames')}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('memoryGameDesc')}
              </p>
            </div>
            <button className="btn-primary btn-emerald" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px' }}>
              <Play size={18} /> {t('startActivity')}
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
              minHeight: '210px',
              border: '1px solid #FDE68A',
              background: '#FFFFFF',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Reminders"
          >
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Bell size={28} color="var(--accent-amber)" />
              </div>
              <h4 className="text-card-title">{t('remindersCard')}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('remindersTitle')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', border: '1px solid #FDE68A', color: 'var(--accent-amber)' }}>
              <Bell size={18} /> {t('remindersCard')}
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
              minHeight: '210px',
              border: '1px solid #C7D2FE',
              background: '#FFFFFF',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to My Progress"
          >
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <BarChart2 size={28} color="var(--accent-indigo)" />
              </div>
              <h4 className="text-card-title">{t('myProgress')}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('myProgress')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', border: '1px solid #C7D2FE', color: 'var(--accent-indigo)' }}>
              <BarChart2 size={18} /> {t('myProgress')}
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
              minHeight: '210px',
              border: '1px solid #99F6E4',
              background: '#FFFFFF',
            }}
            role="button"
            tabIndex={0}
            aria-label="Activate Voice Assistance"
          >
            <div>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Mic size={28} color="var(--accent-teal)" />
              </div>
              <h4 className="text-card-title">{t('voiceAssistance')}</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {t('voicePrompt')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '48px', marginTop: '16px', fontSize: '16px', border: '1px solid #99F6E4', color: 'var(--accent-teal)' }}>
              <Mic size={18} /> {t('voiceAssistance')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
