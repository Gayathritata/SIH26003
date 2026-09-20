import React, { useState, useEffect } from 'react';
import { Mail, Shield, Globe, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Language } from '../i18n';
import { UserProfile } from '../services/authService';
import { apiClient, fetchCaregiverProfileApi } from '../services/api';

interface Props {
  user: UserProfile | null;
  onBack: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onBack }) => {
  const { t, lang, setLang } = useAccessibility();

  const [profileData, setProfileData] = useState<UserProfile | null>(user);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(lang);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [caregiverInfo, setCaregiverInfo] = useState<{ contactInfo?: string; assignedPatientCount?: number } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auth/me');
      if (res.data && res.data.user) {
        setProfileData(res.data.user);
        if (res.data.user.preferredLanguage || res.data.user.language) {
          const fetchedLang = res.data.user.preferredLanguage || res.data.user.language;
          if (['en', 'hi', 'as'].includes(fetchedLang)) {
            setSelectedLanguage(fetchedLang as Language);
          }
        }
      }

      if (user?.role === 'caregiver' || res.data?.user?.role === 'caregiver') {
        const cgRes = await fetchCaregiverProfileApi();
        if (cgRes && cgRes.success && cgRes.caregiver) {
          setCaregiverInfo({
            contactInfo: cgRes.caregiver.contactInfo,
            assignedPatientCount: cgRes.caregiver.assignedPatientCount,
          });
        }
      }
    } catch (err) {
      console.warn('[PROFILE FETCH NOTICE] Using existing auth session data fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setLang(selectedLanguage);
    setSaveSuccessMsg(t('profileSavedNotice'));
    setTimeout(() => setSaveSuccessMsg(null), 3000);

    try {
      await apiClient.post('/auth/profile', {
        preferredLanguage: selectedLanguage,
      });
    } catch (e) {
      console.warn('[PROFILE UPDATE NOTICE]', e);
    }
  };

  const activeUser = profileData || user;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 16px', fontSize: '15px' }}
          aria-label="Go Back"
        >
          <ArrowLeft size={18} /> {t('backToHome')}
        </button>

        <h2 className="text-section-title">{activeUser?.role === 'caregiver' ? 'Caregiver Profile' : t('profileTitle')}</h2>

        <button
          onClick={fetchProfile}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '40px', width: '40px', padding: 0 }}
          title="Refresh Profile"
          aria-label="Refresh Profile"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            background: '#DCFCE7',
            border: '1px solid #86EFAC',
            borderRadius: '12px',
            padding: '12px 18px',
            color: '#15803D',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '15px',
            fontWeight: '600',
          }}
        >
          <CheckCircle2 size={20} color="#15803D" />
          {saveSuccessMsg}
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', background: '#FFFFFF' }}>
          <RefreshCw size={32} className="pulse-mic" color="var(--accent-primary)" />
          <p className="text-body-elderly" style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading Profile Information...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '28px', background: '#FFFFFF' }}>
          {/* User Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '800',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {activeUser?.name || 'MINDMATE User'}
              </h3>
              <span className="badge-pill badge-emerald" style={{ marginTop: '4px' }}>
                Role: {activeUser?.role || 'elderly'}
              </span>
            </div>
          </div>

          {/* Caregiver Summary Cards */}
          {activeUser?.role === 'caregiver' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Assigned Patients</span>
                <p style={{ fontSize: '24px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '2px' }}>
                  {caregiverInfo?.assignedPatientCount ?? 0}
                </p>
              </div>
              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Contact Info</span>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '6px', wordBreak: 'break-all' }}>
                  {caregiverInfo?.contactInfo || activeUser.email}
                </p>
              </div>
            </div>
          )}

          {/* User Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={16} color="var(--accent-primary)" /> {t('profileEmail')}
              </label>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                }}
              >
                {activeUser?.email || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="var(--accent-primary)" /> {t('profileRole')}
              </label>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--text-primary)',
                  textTransform: 'capitalize',
                }}
              >
                {activeUser?.role || 'elderly'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--accent-primary)" /> {t('profileLang')}
              </label>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { code: 'en', name: 'English' },
                  { code: 'hi', name: 'हिन्दी (Hindi)' },
                  { code: 'as', name: 'অসমীয়া (Assamese)' },
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLanguage(l.code as Language)}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      borderRadius: '10px',
                      border: selectedLanguage === l.code ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                      background: selectedLanguage === l.code ? 'var(--accent-primary-glow)' : '#F8FAFC',
                      color: selectedLanguage === l.code ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary btn-emerald"
              onClick={handleSavePreferences}
              style={{ width: '100%', minHeight: '48px', marginTop: '8px', fontSize: '16px' }}
            >
              {t('savePreferences')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
