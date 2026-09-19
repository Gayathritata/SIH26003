import React, { ReactNode } from 'react';
import { Brain, Wifi, WifiOff, UserCheck, User, Settings as SettingsIcon, LogOut, VolumeX, Eye, Type, RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../context/AccessibilityContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { VantaBackground } from '../components/VantaBackground';
import { Language } from '../i18n';

interface AppLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const { lang, setLang, textSize, setTextSize, highContrast, setHighContrast, isSpeaking, stopVoice, t } = useAccessibility();
  const { isOffline, syncStatus, pendingCount, syncNow } = useNetworkStatus();

  const isCaregiverOrAdmin = user?.role === 'caregiver' || user?.role === 'admin';

  return (
    <div className={`font-scale-${textSize}`} style={{ position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Elderly-Friendly Network Status Badge */}
          <span className={`badge-pill ${isOffline ? 'badge-coral' : syncStatus === 'syncing' ? 'badge-amber' : syncStatus === 'synced' ? 'badge-emerald' : 'badge-emerald'}`}>
            {isOffline ? <WifiOff size={15} /> : <Wifi size={15} />}
            {syncStatus === 'syncing'
              ? 'Syncing...'
              : syncStatus === 'synced'
              ? 'All sessions synced'
              : isOffline
              ? 'Offline'
              : 'Online'}
          </span>

          {/* Pending Sessions Count & Manual Sync Now Button */}
          {pendingCount > 0 && (
            <button
              onClick={syncNow}
              disabled={isOffline || syncStatus === 'syncing'}
              className="btn-primary btn-emerald"
              style={{
                minHeight: '38px',
                padding: '0 12px',
                fontSize: '13px',
                borderRadius: '12px',
                background: isOffline ? 'rgba(255,255,255,0.1)' : undefined,
              }}
              title="Click to sync pending game sessions to cloud"
            >
              <RefreshCw size={14} className={syncStatus === 'syncing' ? 'pulse-mic' : ''} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : `${pendingCount} to sync — Sync Now`}</span>
            </button>
          )}

          {/* Stop Voice Audio Button when Speaking */}
          {isSpeaking && (
            <button
              onClick={stopVoice}
              className="btn-primary"
              style={{
                minHeight: '38px',
                padding: '0 12px',
                fontSize: '13px',
                background: '#EF4444',
                color: '#FFFFFF',
                borderRadius: '10px',
              }}
              title={t('stopVoice')}
              aria-label={t('stopVoice')}
            >
              <VolumeX size={16} /> {t('stopVoice')}
            </button>
          )}

          {/* Language Selector Pills */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.06)', padding: '4px', borderRadius: '12px' }}>
            {(['en', 'hi', 'as'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
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

          {/* Text Size Quick Switcher */}
          <button
            onClick={() => setTextSize(textSize === 'normal' ? 'large' : (textSize === 'large' ? 'xlarge' : 'normal'))}
            className="btn-primary btn-glass-subtle"
            style={{ minHeight: '38px', padding: '0 10px', fontSize: '13px' }}
            title={t('textSizeSetting')}
            aria-label={t('textSizeSetting')}
          >
            <Type size={16} />
            <span>{textSize === 'xlarge' ? 'XL' : (textSize === 'large' ? 'L' : 'M')}</span>
          </button>

          {/* High Contrast Mode Quick Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="btn-primary btn-glass-subtle"
            style={{
              minHeight: '38px',
              padding: '0 10px',
              fontSize: '13px',
              borderColor: highContrast ? '#FACC15' : undefined,
              color: highContrast ? '#FACC15' : undefined,
            }}
            title={t('highContrastSetting')}
            aria-label={t('highContrastSetting')}
          >
            <Eye size={16} />
          </button>

          {/* Role Dashboard Toggle for Caregiver & Admin */}
          {isCaregiverOrAdmin && (
            <button
              className="btn-primary btn-glass-subtle"
              onClick={() => onNavigate(currentPath.startsWith('/caregiver') ? '/dashboard' : '/caregiver')}
              style={{ minHeight: '38px', padding: '0 12px', fontSize: '13px' }}
              aria-label="Toggle Dashboard View"
            >
              <UserCheck size={16} color="#EC4899" />
              {currentPath.startsWith('/caregiver') ? t('elderlyMode') : t('caregiverDashboard')}
            </button>
          )}

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/profile')}
            style={{ minHeight: '38px', padding: '0 10px' }}
            title={t('profileTitle')}
            aria-label={t('profileTitle')}
          >
            <User size={16} color="#6EE7B7" />
          </button>

          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/settings')}
            style={{ minHeight: '38px', padding: '0 10px' }}
            title={t('settingsTitle')}
            aria-label={t('settingsTitle')}
          >
            <SettingsIcon size={16} color="#C4B5FD" />
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
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            <LogOut size={16} /> {t('logoutButton')}
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
