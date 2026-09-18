import React, { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, Heart, TrendingUp, RefreshCw, Users, Activity, Bell, Settings } from 'lucide-react';
import { apiClient } from '../services/api';
import { translations, getTranslation, Language } from '../i18n/translations';
import { UserProfile } from '../services/authService';

interface Props {
  user?: UserProfile | null;
  onBackToElderly: () => void;
  onNavigateSettings?: () => void;
  lang: Language;
}

export const CaregiverDashboard: React.FC<Props> = ({ user, onBackToElderly, onNavigateSettings, lang }) => {
  const t = (key: keyof typeof translations['en']) => getTranslation(lang, key);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'patients' | 'performance' | 'alerts' | 'reminders' | 'settings'>('patients');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/dashboard/overview');
      if (response.data && response.data.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.warn('[CAREGIVER DASHBOARD ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center' }}>
        <RefreshCw size={40} className="pulse-mic" color="#10B981" />
        <p className="text-body-elderly" style={{ marginTop: '20px', color: '#94A3B8' }}>Loading Caregiver Dashboard...</p>
      </div>
    );
  }

  const patient = dashboardData?.patient || { name: 'Asha Devi', age: 74, region: 'South_NER', language: lang };
  const indicators = dashboardData?.analytics?.cognitiveIndicators || {
    memoryScore: 85,
    attentionScore: 90,
    recognitionScore: 88,
    responseScore: 78,
    consistencyScore: 92,
    engagementScore: 75,
    overallIndex: 85,
  };
  const alerts = dashboardData?.alerts || [
    { _id: '1', message: 'Missed evening cognitive game activity.', severity: 'medium', createdAt: '2026-09-10' },
  ];
  const reminders = dashboardData?.reminders || [
    { _id: '1', title: '💊 Morning Medication', scheduledTime: '08:00 AM', status: 'completed' },
    { _id: '2', title: '💧 Drink 1 Glass of Water', scheduledTime: '10:30 AM', status: 'completed' },
    { _id: '3', title: '🧠 Play Cognitive Brain Game', scheduledTime: '04:00 PM', status: 'pending' },
  ];
  const caregiverName = user?.name || 'Authenticated Caregiver';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Caregiver Top Hero Bar */}
      <div className="hero-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <UserCheck size={32} color="#FFFFFF" />
          </div>
          <div>
            <span style={{ fontSize: '14px', color: '#6EE7B7', fontWeight: '600' }}>{t('caregiverPanel')} — {caregiverName}</span>
            <h2 className="text-hero-title" style={{ fontSize: '28px' }}>{patient.name} ({patient.age} yrs)</h2>
          </div>
        </div>

        <button className="btn-primary btn-glass-subtle" onClick={onBackToElderly} style={{ minHeight: '44px', fontSize: '14px' }}>
          {t('backToPatient')}
        </button>
      </div>

      {/* Actionable Alert Banner */}
      {alerts.length > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(225, 29, 72, 0.15))',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: '20px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <AlertTriangle size={28} color="#F43F5E" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#FDA4AF' }}>{t('alerts')}</span>
            <p style={{ fontSize: '14px', color: '#F1F5F9', marginTop: '4px' }}>{alerts[0].message}</p>
          </div>
          <span className="badge-pill badge-coral">Active Alert</span>
        </div>
      )}

      {/* Caregiver Navigation Tabs (5 Core Features: Patients, Performance, Alerts, Reminders, Settings) */}
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.04)', padding: '6px', borderRadius: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'patients', label: t('myPatients'), icon: Users },
          { key: 'performance', label: t('patientPerformance'), icon: Activity },
          { key: 'alerts', label: t('alerts'), icon: AlertTriangle },
          { key: 'reminders', label: t('remindersTitle'), icon: Bell },
          { key: 'settings', label: t('settingsCard'), icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                if (tab.key === 'settings' && onNavigateSettings) {
                  onNavigateSettings();
                } else {
                  setActiveTab(tab.key as any);
                }
              }}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '12px 14px',
                borderRadius: '12px',
                border: 'none',
                background: isActive ? '#10B981' : 'transparent',
                color: '#FFFFFF',
                fontWeight: '700',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              aria-pressed={isActive}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: 👴 My Patients */}
      {activeTab === 'patients' && (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 className="text-section-title">{t('myPatients')}</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>
                {patient.name.charAt(0)}
              </div>
              <div>
                <h4 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{patient.name}</h4>
                <p style={{ fontSize: '14px', color: '#94A3B8' }}>Age: {patient.age} | Region: {patient.region || 'South_NER'}</p>
              </div>
            </div>
            <span className="badge-pill badge-emerald">Primary Patient</span>
          </div>
        </div>
      )}

      {/* Tab 2: 📊 Patient Performance */}
      {activeTab === 'performance' && (
        <div className="dashboard-grid">
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="text-section-title">{t('overallIndex')}</h3>
              <span className="badge-pill badge-emerald">{indicators.overallIndex}%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: t('memoryScoreLabel'), val: indicators.memoryScore, color: '#10B981' },
                { label: t('attentionScoreLabel'), val: indicators.attentionScore, color: '#F59E0B' },
                { label: t('recognitionScoreLabel'), val: indicators.recognitionScore, color: '#14B8A6' },
                { label: t('responseScoreLabel'), val: indicators.responseScore, color: '#6366F1' },
                { label: t('consistencyScoreLabel'), val: indicators.consistencyScore, color: '#8B5CF6' },
                { label: t('engagementScoreLabel'), val: indicators.engagementScore, color: '#F43F5E' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', marginBottom: '6px' }}>
                    <span style={{ color: '#E2E8F0', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontWeight: '800', color: item.color }}>{item.val}%</span>
                  </div>
                  <div style={{ height: '10px', borderRadius: '5px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '5px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <Heart size={32} color="#F43F5E" style={{ margin: '0 auto 10px' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('reportedMood')}</span>
              <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', marginTop: '4px' }}>
                {t('moodGood')}
              </h4>
            </div>

            <div className="glass-panel" style={{ textAlign: 'center' }}>
              <TrendingUp size={32} color="#10B981" style={{ margin: '0 auto 10px' }} />
              <span style={{ fontSize: '14px', color: '#94A3B8' }}>{t('medicationAdherence')}</span>
              <h4 style={{ fontSize: '24px', fontWeight: '800', color: '#10B981', marginTop: '4px' }}>
                85%
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: 🚨 Alerts */}
      {activeTab === 'alerts' && (
        <div className="glass-panel">
          <h3 className="text-section-title" style={{ marginBottom: '16px' }}>{t('alerts')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((a: any, idx: number) => (
              <div
                key={a._id || idx}
                style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: '#FDA4AF' }}>{a.message}</span>
                  <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>Timestamp: {a.createdAt || 'Today'}</p>
                </div>
                <span className="badge-pill badge-coral">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: 💊 Reminders */}
      {activeTab === 'reminders' && (
        <div className="glass-panel">
          <h3 className="text-section-title" style={{ marginBottom: '16px' }}>{t('remindersTitle')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reminders.map((r: any) => (
              <div
                key={r._id || r.title}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '17px', fontWeight: '700', color: '#FFFFFF' }}>{r.title}</span>
                  <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '2px' }}>{r.scheduledTime}</p>
                </div>
                <span className={`badge-pill ${r.status === 'completed' ? 'badge-emerald' : 'badge-amber'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: ⚙️ Settings */}
      {activeTab === 'settings' && (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <Settings size={40} color="#8B5CF6" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF' }}>{t('settingsTitle')}</h3>
          <p style={{ color: '#94A3B8', marginTop: '8px' }}>Open app-wide settings to adjust language, text size, and audio preferences.</p>
          <button
            className="btn-primary btn-emerald"
            onClick={onNavigateSettings}
            style={{ marginTop: '20px', minHeight: '50px' }}
          >
            {t('settingsTitle')}
          </button>
        </div>
      )}
    </div>
  );
};
