import React, { useState, useEffect } from 'react';
import { Users, User, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/api';
import { getTranslation, Language } from '../utils/i18n';

interface PatientsPageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ lang, onNavigate }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/patients');
      if (response.data && response.data.patients) {
        setPatients(response.data.patients);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.warn('[PATIENTS FETCH NOTICE] API response not available, displaying clean empty state:', err);
      setPatients([]);
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
        <h2 className="text-section-title">{t('myPatients')}</h2>
        <button onClick={fetchPatients} className="btn-primary btn-glass-subtle" style={{ minHeight: '40px', width: '40px', padding: 0 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>
            <RefreshCw size={32} className="pulse-mic" color="var(--accent-primary)" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading patient list...</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={28} color="var(--text-muted)" />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>No patient activity available yet</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
              Assigned patients and their daily session activity will appear here once connected to your caregiver profile.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {patients.map((p, idx) => (
              <div
                key={p._id || idx}
                style={{
                  padding: '16px 20px',
                  borderRadius: '14px',
                  background: '#F8FAFC',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #0284C7, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="#FFFFFF" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{p.name || 'Patient User'}</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>Age: {p.age || 'N/A'} | Language: {p.language || 'en'}</p>
                  </div>
                </div>
                <span className="badge-pill badge-emerald" style={{ fontSize: '12px' }}>Active Patient</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
