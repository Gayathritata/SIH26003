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
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('/caregiver')} className="btn-primary btn-glass-subtle" style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}>
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">{t('patientPerformance')}</h2>
        <button onClick={fetchPerformance} className="btn-primary btn-glass-subtle" style={{ minHeight: '44px', width: '44px', padding: 0 }}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={36} className="pulse-mic" color="#10B981" />
            <p style={{ marginTop: '16px', color: '#94A3B8' }}>Loading performance analytics...</p>
          </div>
        ) : !analytics || !analytics.cognitiveIndicators ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={32} color="#94A3B8" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>No patient activity available yet</h3>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '420px' }}>
              Cognitive performance indicators and activity trends will calculate automatically when game sessions are completed.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF' }}>{t('overallIndex')}</h3>
              <span className="badge-pill badge-emerald">{analytics.cognitiveIndicators.overallIndex || 85}%</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: t('memoryScoreLabel'), val: analytics.cognitiveIndicators.memoryScore || 85, color: '#10B981' },
                { label: t('attentionScoreLabel'), val: analytics.cognitiveIndicators.attentionScore || 90, color: '#F59E0B' },
                { label: t('recognitionScoreLabel'), val: analytics.cognitiveIndicators.recognitionScore || 88, color: '#14B8A6' },
                { label: t('responseScoreLabel'), val: analytics.cognitiveIndicators.responseScore || 78, color: '#6366F1' },
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
        )}
      </div>
    </div>
  );
};
