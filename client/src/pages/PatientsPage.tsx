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
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onNavigate('/caregiver')} className="btn-primary btn-glass-subtle" style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}>
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">{t('myPatients')}</h2>
        <button onClick={fetchPatients} className="btn-primary btn-glass-subtle" style={{ minHeight: '44px', width: '44px', padding: 0 }}>
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '32px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={36} className="pulse-mic" color="#10B981" />
            <p style={{ marginTop: '16px', color: '#94A3B8' }}>Loading patient list...</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={32} color="#94A3B8" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#FFFFFF' }}>No patient activity available yet</h3>
            <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '420px' }}>
              Assigned patients and their daily session activity will appear here once connected to your caregiver profile.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {patients.map((p, idx) => (
              <div
                key={p._id || idx}
                style={{
                  padding: '20px',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color="#FFFFFF" />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF' }}>{p.name || 'Patient User'}</h4>
                    <p style={{ fontSize: '14px', color: '#94A3B8' }}>Age: {p.age || 'N/A'} | Language: {p.language || 'en'}</p>
                  </div>
                </div>
                <span className="badge-pill badge-emerald">Active Patient</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
