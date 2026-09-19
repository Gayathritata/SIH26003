import React, { useState, useEffect } from 'react';
import { Mail, Shield, Globe, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { Language } from '../i18n';
import { UserProfile } from '../services/authService';
import { apiClient } from '../services/api';

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
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}
          aria-label="Go Back"
        >
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>

        <h2 className="text-section-title">{t('profileTitle')}</h2>

        <button
          onClick={fetchProfile}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '44px', width: '44px', padding: 0 }}
          title="Refresh Profile"
          aria-label="Refresh Profile"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {saveSuccessMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            borderRadius: '16px',
            padding: '14px 20px',
            color: '#6EE7B7',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          <CheckCircle2 size={22} color="#10B981" />
          {saveSuccessMsg}
        </div>
      )}

      {loading ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <RefreshCw size={36} className="pulse-mic" color="#EC4899" />
          <p className="text-body-elderly" style={{ marginTop: '16px' }}>Loading Profile Information...</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px' }}>
          {/* User Avatar & Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '24px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: '800',
                color: '#FFFFFF',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)',
              }}
            >
              {activeUser?.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF' }}>
                {activeUser?.name || 'MINDMATE User'}
              </h3>
              <span className="badge-pill badge-emerald" style={{ marginTop: '6px' }}>
                Role: {activeUser?.role || 'elderly'}
              </span>
            </div>
          </div>

          {/* User Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '15px', color: '#D8B4FE', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} color="#EC4899" /> {t('profileEmail')}
              </label>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#F1F5F9',
                }}
              >
                {activeUser?.email || 'N/A'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '15px', color: '#D8B4FE', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} color="#EC4899" /> {t('profileRole')}
              </label>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#F1F5F9',
                  textTransform: 'capitalize',
                }}
              >
                {activeUser?.role || 'elderly'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '15px', color: '#D8B4FE', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={18} color="#EC4899" /> {t('profileLang')}
              </label>

              <div style={{ display: 'flex', gap: '10px' }}>
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
                      minHeight: '52px',
                      borderRadius: '14px',
                      border: selectedLanguage === l.code ? '2px solid #EC4899' : '1px solid var(--border-glass)',
                      background: selectedLanguage === l.code ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      color: selectedLanguage === l.code ? '#F472B6' : '#FFFFFF',
                      fontWeight: '700',
                      fontSize: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
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
              style={{ width: '100%', minHeight: '56px', marginTop: '12px', fontSize: '18px' }}
            >
              {t('savePreferences')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
