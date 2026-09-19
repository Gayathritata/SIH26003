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
          <div style={{ display: 'flex', gap: '8px' }}>
            {voiceEnabled && (
              <button
                onClick={() => speak(`${t('goodMorning')}. ${t('helloUser')}`)}
                className="btn-primary btn-glass-subtle"
                style={{ minHeight: '44px', padding: '0 12px' }}
                title={t('listenInstructions')}
                aria-label={t('listenInstructions')}
              >
                <Volume2 size={18} color="#F472B6" />
              </button>
            )}
            <button
              onClick={() => onNavigate('profile')}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '44px', padding: '0 16px', fontSize: '15px' }}
              aria-label="View Profile"
            >
              <User size={18} color="#EC4899" />
              {t('profileTitle')}
            </button>
          </div>
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
              onClick={() => {
                onSelectMood(m.key);
                if (voiceEnabled) {
                  speak(t(m.labelKey), true);
                }
              }}
              className={`mood-chip ${selectedMood === m.key ? 'active' : ''}`}
              role="radio"
              aria-checked={selectedMood === m.key}
              style={{ minHeight: '52px', padding: '12px 20px', fontSize: '18px' }}
            >
              {t(m.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* Elderly Navigation Cards (4 Large Dashboard Targets) */}
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
              border: '2px solid rgba(236, 72, 153, 0.4)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to Cognitive Games"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(236, 72, 153, 0.2)', border: '1px solid #EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Brain size={32} color="#EC4899" />
              </div>
              <h4 className="text-card-title">{t('cognitiveGames')}</h4>
              <p style={{ fontSize: '15px', color: '#D8B4FE', marginTop: '6px' }}>
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
              border: '2px solid rgba(245, 158, 11, 0.4)',
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
              <p style={{ fontSize: '15px', color: '#D8B4FE', marginTop: '6px' }}>
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
              border: '2px solid rgba(168, 85, 247, 0.4)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Navigate to My Progress"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #A855F7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <BarChart2 size={32} color="#A855F7" />
              </div>
              <h4 className="text-card-title">{t('myProgress')}</h4>
              <p style={{ fontSize: '15px', color: '#D8B4FE', marginTop: '6px' }}>
                {t('myProgress')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #A855F7', color: '#C084FC' }}>
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
              border: '2px solid rgba(217, 70, 239, 0.4)',
            }}
            role="button"
            tabIndex={0}
            aria-label="Activate Voice Assistance"
          >
            <div>
              <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'rgba(217, 70, 239, 0.2)', border: '1px solid #D946EF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Mic size={32} color="#D946EF" />
              </div>
              <h4 className="text-card-title">{t('voiceAssistance')}</h4>
              <p style={{ fontSize: '15px', color: '#D8B4FE', marginTop: '6px' }}>
                {t('voicePrompt')}
              </p>
            </div>
            <button className="btn-primary btn-glass-subtle" style={{ width: '100%', minHeight: '52px', marginTop: '16px', fontSize: '17px', border: '1px solid #D946EF', color: '#F0ABFC' }}>
              <Mic size={20} /> {t('voiceAssistance')}
            </button>
          </div>

        </div>
      </section>
    </div>
  );
};
