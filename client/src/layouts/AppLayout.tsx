import React, { ReactNode } from 'react';
import { Brain, Wifi, WifiOff, UserCheck, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getTranslation, Language } from '../utils/i18n';
import { offlineService } from '../services/offlineService';
import { VantaBackground } from '../components/VantaBackground';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  lang: Language;
  onLangChange: (lang: Language) => void;
  voiceEnabled?: boolean;
  onTriggerVoice?: () => void;
  textSize?: 'normal' | 'large' | 'xlarge';
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
  lang,
  onLangChange,
  voiceEnabled = true,
  onTriggerVoice,
  textSize = 'normal',
}) => {
  const { user, logout } = useAuth();
  const isOffline = offlineService.isOffline();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';

  return (
    <div className={`font-scale-${textSize}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#070A12' }}>
      {/* Vanta 3D NET Background Animation */}
      <VantaBackground />

      {/* Top Navbar */}
      <header className="app-header" role="banner" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => onNavigate(isCaregiverOrAdmin ? '/caregiver' : '/dashboard')}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(236, 72, 153, 0.45)',
            }}
          >
            <Brain size={26} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px' }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '12px', color: '#D8B4FE', fontWeight: '500' }}>{t('tagline')}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span className={`badge-pill ${isOffline ? 'badge-coral' : 'badge-emerald'}`}>
            {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
            {isOffline ? t('offlineBanner') : t('onlineBanner')}
          </span>

          {/* Language Selector Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px' }}>
            {(['en', 'hi', 'as'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onLangChange(l)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '9px',
                  border: 'none',
                  background: lang === l ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'transparent',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                aria-pressed={lang === l}
              >
                {l === 'as' ? 'অসমীয়া' : l === 'hi' ? 'हिन्दी' : 'ENG'}
              </button>
            ))}
          </div>

          {/* Role Dashboard Toggle for Caregiver & Admin */}
          {isCaregiverOrAdmin && (
            <button
              className="btn-primary btn-glass-subtle"
              onClick={() => onNavigate(currentPath.startsWith('/caregiver') ? '/dashboard' : '/caregiver')}
              style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px' }}
              aria-label="Toggle Dashboard View"
            >
              <UserCheck size={18} color="#EC4899" />
              {currentPath.startsWith('/caregiver') ? t('elderlyMode') : t('caregiverDashboard')}
            </button>
          )}

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/profile')}
            style={{ minHeight: '44px', padding: '0 12px' }}
            title={t('profileTitle')}
            aria-label={t('profileTitle')}
          >
            <User size={18} color="#6EE7B7" />
          </button>

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/settings')}
            style={{ minHeight: '44px', padding: '0 12px' }}
            title={t('settingsTitle')}
            aria-label={t('settingsTitle')}
          >
            <SettingsIcon size={18} color="#C4B5FD" />
          </button>

          <button
            onClick={logout}
            title={t('logoutButton')}
            aria-label={t('logoutButton')}
            style={{
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              color: '#FDA4AF',
              padding: '10px 14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: '700',
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content" role="main" style={{ position: 'relative', zIndex: 1, flex: 1, padding: '24px 16px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {children}
      </main>
    </div>
  );
};
