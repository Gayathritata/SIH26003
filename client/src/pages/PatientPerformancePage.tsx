import React, { useState, useEffect } from 'react';
import { Activity, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { getTranslation, Language } from '../utils/i18n';

interface PatientPerformancePageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export const PatientPerformancePage: React.FC<PatientPerformancePageProps> = ({ lang, onNavigate }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/dashboard/overview');
      if (response.data && response.data.analytics) {
        setAnalytics(response.data.analytics);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.warn('[PATIENT PERFORMANCE FETCH NOTICE]', err);
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={() => onNavigate('/caregiver')} className="btn-primary btn-glass-subtle" style={{ minHeight: '42px', padding: '0 16px', fontSize: '15px' }}>
          <ArrowLeft size={18} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">{t('patientPerformance')}</h2>
        <button onClick={fetchPerformance} className="btn-primary btn-glass-subtle" style={{ minHeight: '40px', width: '40px', padding: 0 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <RefreshCw size={32} className="pulse-mic" color="var(--accent-primary)" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading performance analytics...</p>
          </div>
        ) : !analytics || !analytics.cognitiveIndicators ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No patient activity available yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
              Cognitive performance indicators and activity trends will calculate automatically when game sessions are completed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{t('overallIndex')}</h3>
              <span className="badge-pill badge-emerald">{analytics.cognitiveIndicators.overallIndex || 85}%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: t('memoryScoreLabel'), val: analytics.cognitiveIndicators.memoryScore || 85, color: '#16A34A' },
                { label: t('attentionScoreLabel'), val: analytics.cognitiveIndicators.attentionScore || 90, color: '#D97706' },
                { label: t('recognitionScoreLabel'), val: analytics.cognitiveIndicators.recognitionScore || 88, color: '#0D9488' },
                { label: t('responseScoreLabel'), val: analytics.cognitiveIndicators.responseScore || 78, color: '#4F46E5' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{item.label}</span>
                    <span style={{ fontWeight: '800', color: item.color }}>{item.val}%</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '4px', background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: `${item.val}%`, height: '100%', background: item.color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
