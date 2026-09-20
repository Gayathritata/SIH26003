import React, { useState, useEffect } from 'react';
import { Brain, Target, Flame, TrendingUp, Sparkles, User, Volume2, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { UserProfile } from '../services/authService';
import { fetchMyGameSessions } from '../services/api';

interface Props {
  user: UserProfile | null;
  difficulty: number;
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
  onNavigate: (screen: 'games' | 'reminders' | 'my_progress' | 'profile' | 'settings' | 'caregiver') => void;
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
  const { isOffline, syncStatus } = useNetworkStatus();

  const [todaySessionsCount, setTodaySessionsCount] = useState<number>(0);
  const [streakDays, setStreakDays] = useState<number>(1);
  const [performanceTrendText, setPerformanceTrendText] = useState<string>('Improving');

  useEffect(() => {
    loadSessionsData();
  }, []);

  const loadSessionsData = async () => {
    try {
      const res = await fetchMyGameSessions();
      let sessionsList: any[] = [];
      if (res && res.success && Array.isArray(res.sessions)) {
        sessionsList = res.sessions;
      } else if (Array.isArray(res)) {
        sessionsList = res;
      }

      if (sessionsList.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const countToday = sessionsList.filter((s: any) => {
          const sDate = (s.completedAt || s.createdAt || '').split('T')[0];
          return sDate === todayStr;
        }).length;
        setTodaySessionsCount(countToday);

        // Calculate streak
        const datesSet = new Set(
          sessionsList.map((s: any) => (s.completedAt || s.createdAt || '').split('T')[0]).filter(Boolean)
        );
        setStreakDays(Math.max(1, datesSet.size));

        // Calculate performance trend from average accuracy
        const avgAcc = sessionsList.reduce((sum: number, s: any) => sum + (s.accuracy || 0), 0) / sessionsList.length;
        if (avgAcc >= 75) {
          setPerformanceTrendText('Improving');
        } else if (avgAcc >= 50) {
          setPerformanceTrendText('Stable');
        } else {
          setPerformanceTrendText('Active Engagement');
        }
      }
    } catch (e) {
      console.warn('[HOME SESSIONS DATA FETCH NOTICE]', e);
    }
  };

  const moodOptions = [
    { key: 'happy', labelKey: 'moodHappy' as const },
    { key: 'good', labelKey: 'moodGood' as const },
    { key: 'okay', labelKey: 'moodOkay' as const },
    { key: 'worried', labelKey: 'moodWorried' as const },
    { key: 'sad', labelKey: 'moodSad' as const },
  ];

  const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Hero Welcome Banner */}
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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
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

      {/* 2. Mood Check-in Section */}
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

      {/* 3. Today's AI Insights Section */}
      <section aria-label="Today's AI Insights">
        <h3 className="text-section-title" style={{ marginBottom: '16px' }}>
          Today's AI Insights
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {/* Card 1 — Cognitive Activity */}
          <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Brain size={22} color="var(--accent-primary)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Cognitive Activity</span>
            </div>
            <p style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {todaySessionsCount > 0 ? `${todaySessionsCount} activities completed` : '0 activities today'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Keep your daily routine going
            </p>
          </div>

          {/* Card 2 — AI Recommendation */}
          <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-amber-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={22} color="var(--accent-amber)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>AI Recommendation</span>
            </div>
            <p style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              Try Pattern Recognition
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Recommended for Level {difficulty}
            </p>
          </div>

          {/* Card 3 — Daily Streak */}
          <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={22} color="var(--accent-rose)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Daily Streak</span>
            </div>
            <p style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', margin: '4px 0 0 0' }}>
              {streakDays > 0 ? `${streakDays} Days` : 'Start your streak today'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Keep your momentum going
            </p>
          </div>

          {/* Card 4 — Performance Trend */}
          <div className="glass-panel" style={{ padding: '20px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-teal-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={22} color="var(--accent-teal)" />
              </div>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Performance Trend</span>
            </div>
            <p style={{ fontSize: '19px', fontWeight: '800', color: '#15803D', margin: '4px 0 0 0' }}>
              {performanceTrendText}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Based on recent activity
            </p>
          </div>
        </div>
      </section>

      {/* 4. Caregiver Connection Section */}
      <section aria-label="Caregiver Connection">
        <h3 className="text-section-title" style={{ marginBottom: '16px' }}>
          Caregiver Connection
        </h3>

        <div
          className="glass-panel"
          style={{
            padding: '24px',
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {/* Sync Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={22} color="#15803D" />
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                  {isOffline ? 'Offline Mode' : '✓ Data synced'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {syncStatus === 'syncing' ? 'Syncing...' : 'All sessions uploaded'}
                </span>
              </div>
            </div>

            {/* Activity Summary */}
            <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                Today's activity
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {todaySessionsCount} sessions completed
              </span>
            </div>

            {/* Caregiver Status */}
            <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--border-glass)' }}>
              <span className="badge-pill badge-emerald" style={{ fontSize: '12px' }}>
                Caregiver connected
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate(isCaregiverOrAdmin ? 'caregiver' : ('my_progress' as any))}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '44px', padding: '0 18px', fontSize: '14px', color: 'var(--accent-primary)', border: '1px solid #BAE6FD' }}
          >
            View Caregiver Summary <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 5. Daily Motivation Section */}
      <section aria-label="Daily Motivation">
        <div
          className="glass-panel"
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, #F0FDF4 0%, #E0F2FE 100%)',
            border: '1px solid #BAE6FD',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-teal)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            A little encouragement for today
          </span>
          <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
            You're doing well today, {user?.name ? user.name.split(' ')[0] : 'Krishna'}! 🌟
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            Keep taking a few minutes each day to stay engaged and active with MINDMATE NER.
          </p>
        </div>
      </section>
    </div>
  );
};
