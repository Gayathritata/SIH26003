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
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('/caregiver')} className="btn-primary btn-glass-subtle" style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}>
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">{t('alerts')}</h2>
        <button onClick={fetchAlerts} className="btn-primary btn-glass-subtle" style={{ minHeight: '44px', width: '44px', padding: 0 }}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={36} className="pulse-mic" color="#10B981" />
            <p style={{ marginTop: '16px', color: '#94A3B8' }}>Loading alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={32} color="#94A3B8" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>No active performance alerts</h3>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '420px' }}>
              Active performance warnings and non-diagnostic alerts will display here when significant baseline variation occurs.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {alerts.map((a, idx) => (
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
                <span className="badge-pill badge-coral">Active Alert</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
