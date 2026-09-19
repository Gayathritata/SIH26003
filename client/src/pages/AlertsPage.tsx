import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { getTranslation, Language } from '../utils/i18n';

interface AlertsPageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ lang, onNavigate }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/alerts');
      if (response.data && response.data.alerts) {
        setAlerts(response.data.alerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.warn('[ALERTS FETCH NOTICE]', err);
      setAlerts([]);
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
        <h2 className="text-section-title">{t('alerts')}</h2>
        <button onClick={fetchAlerts} className="btn-primary btn-glass-subtle" style={{ minHeight: '40px', width: '40px', padding: 0 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <RefreshCw size={32} className="pulse-mic" color="var(--accent-primary)" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F8FAFC', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No active performance alerts</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
              Active performance warnings and non-diagnostic alerts will display here when significant baseline variation occurs.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map((a, idx) => (
              <div
                key={a._id || idx}
                style={{
                  background: '#FFE4E6',
                  border: '1px solid #FECDD3',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#BE123C' }}>{a.message}</span>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', margin: 0 }}>Timestamp: {a.createdAt || 'Today'}</p>
                </div>
                <span className="badge-pill badge-coral">Active Alert</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
