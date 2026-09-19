import React, { ReactNode } from 'react';
import {
  Brain,
  Wifi,
  WifiOff,
  UserCheck,
  User,
  Settings as SettingsIcon,
  LogOut,
  VolumeX,
  Eye,
  Type,
  RefreshCw,
  Home,
  Gamepad2,
  Bell,
  TrendingUp,
  Activity,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useAccessibility } from '../context/AccessibilityContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
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
    <div className={`font-scale-${textSize}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <header className="app-header" role="banner">
        {/* Brand Logo & Title */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          onClick={() => onNavigate(isCaregiverOrAdmin ? '/caregiver' : '/dashboard')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284C7, #0D9488)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.2)',
            }}
          >
            <Brain size={24} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '19px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.2 }}>
              {t('appTitle')}
            </h1>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{t('tagline')}</p>
          </div>
        </div>

        {/* Action Controls & Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Network Status Badge */}
          <span className={`badge-pill ${isOffline ? 'badge-coral' : syncStatus === 'syncing' ? 'badge-amber' : 'badge-emerald'}`}>
            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {syncStatus === 'syncing'
              ? 'Syncing...'
              : syncStatus === 'synced'
              ? 'All synced'
              : isOffline
              ? 'Offline'
              : 'Online'}
          </span>

          {/* Manual Sync Now Button */}
          {pendingCount > 0 && (
            <button
              onClick={syncNow}
              disabled={isOffline || syncStatus === 'syncing'}
              className="btn-primary btn-emerald"
              style={{
                minHeight: '36px',
                padding: '0 12px',
                fontSize: '13px',
                borderRadius: '10px',
              }}
              title="Click to sync pending game sessions"
            >
              <RefreshCw size={14} className={syncStatus === 'syncing' ? 'pulse-mic' : ''} />
              <span>{syncStatus === 'syncing' ? 'Syncing...' : `${pendingCount} to sync`}</span>
            </button>
          )}

          {/* Stop Voice Audio Button */}
          {isSpeaking && (
            <button
              onClick={stopVoice}
              className="btn-primary"
              style={{
                minHeight: '36px',
                padding: '0 12px',
                fontSize: '13px',
                background: '#E11D48',
                color: '#FFFFFF',
                borderRadius: '10px',
              }}
              title={t('stopVoice')}
              aria-label={t('stopVoice')}
            >
              <VolumeX size={15} /> {t('stopVoice')}
            </button>
          )}

          {/* Language Selector */}
          <div style={{ display: 'flex', gap: '2px', background: '#F1F5F9', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
            {(['en', 'hi', 'as'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '7px',
                  border: 'none',
                  background: lang === l ? 'var(--accent-primary)' : 'transparent',
                  color: lang === l ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: lang === l ? '700' : '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
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
            style={{ minHeight: '36px', padding: '0 10px', fontSize: '13px', borderRadius: '10px' }}
            title={t('textSizeSetting')}
            aria-label={t('textSizeSetting')}
          >
            <Type size={15} />
            <span>{textSize === 'xlarge' ? 'XL' : (textSize === 'large' ? 'L' : 'M')}</span>
          </button>

          {/* High Contrast Mode Quick Toggle */}
          <button
            onClick={() => setHighContrast(!highContrast)}
            className="btn-primary btn-glass-subtle"
            style={{
              minHeight: '36px',
              padding: '0 10px',
              fontSize: '13px',
              borderRadius: '10px',
              borderColor: highContrast ? '#FACC15' : undefined,
              color: highContrast ? '#FACC15' : undefined,
            }}
            title={t('highContrastSetting')}
            aria-label={t('highContrastSetting')}
          >
            <Eye size={15} />
          </button>

          {/* Caregiver Dashboard Toggle */}
          {isCaregiverOrAdmin && (
            <button
              className="btn-primary btn-glass-subtle"
              onClick={() => onNavigate(currentPath.startsWith('/caregiver') ? '/dashboard' : '/caregiver')}
              style={{ minHeight: '36px', padding: '0 10px', fontSize: '13px', borderRadius: '10px' }}
              aria-label="Toggle Dashboard View"
            >
              <UserCheck size={15} color="var(--accent-primary)" />
              <span className="hide-mobile-sm">{currentPath.startsWith('/caregiver') ? t('elderlyMode') : t('caregiverDashboard')}</span>
            </button>
          )}

          {/* Profile Shortcut */}
          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/profile')}
            style={{ minHeight: '36px', padding: '0 10px', borderRadius: '10px' }}
            title={t('profileTitle')}
            aria-label={t('profileTitle')}
          >
            <User size={15} color="var(--accent-teal)" />
          </button>

          {/* Settings Shortcut */}
          <button
            className="btn-primary btn-glass-subtle"
            onClick={() => onNavigate('/settings')}
            style={{ minHeight: '36px', padding: '0 10px', borderRadius: '10px' }}
            title={t('settingsTitle')}
            aria-label={t('settingsTitle')}
          >
            <SettingsIcon size={15} color="var(--text-secondary)" />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            title={t('logoutButton')}
            aria-label={t('logoutButton')}
            style={{
              background: '#FFE4E6',
              border: '1px solid #FECDD3',
              borderRadius: '10px',
              color: '#BE123C',
              padding: '7px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: '700',
            }}
          >
            <LogOut size={15} />
            <span className="hide-mobile-sm">{t('logoutButton')}</span>
          </button>
        </div>
      </header>

      {/* Main Body Wrapper (Sidebar + Page Content) */}
      <div className="app-layout-wrapper">
        {/* Desktop & Tablet Sidebar */}
        <aside className="desktop-sidebar">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <button
              onClick={() => onNavigate('/dashboard')}
              className={`sidebar-nav-item ${currentPath === '/dashboard' ? 'active' : ''}`}
            >
              <Home size={19} />
              <span>Home</span>
            </button>

            <button
              onClick={() => onNavigate('/games')}
              className={`sidebar-nav-item ${currentPath === '/games' || currentPath === '/gameplay' ? 'active' : ''}`}
            >
              <Gamepad2 size={19} />
              <span>{t('cognitiveGames')}</span>
            </button>

            <button
              onClick={() => onNavigate('/reminders')}
              className={`sidebar-nav-item ${currentPath === '/reminders' ? 'active' : ''}`}
            >
              <Bell size={19} />
              <span>{t('remindersTitle')}</span>
            </button>

            <button
              onClick={() => onNavigate('/progress')}
              className={`sidebar-nav-item ${currentPath === '/progress' ? 'active' : ''}`}
            >
              <TrendingUp size={19} />
              <span>{t('myProgress')}</span>
            </button>

            {isCaregiverOrAdmin && (
              <>
                <div style={{ margin: '12px 0 6px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Caregiver Portal
                </div>
                <button
                  onClick={() => onNavigate('/caregiver')}
                  className={`sidebar-nav-item ${currentPath === '/caregiver' ? 'active' : ''}`}
                >
                  <Activity size={19} />
                  <span>{t('caregiverDashboard')}</span>
                </button>
                <button
                  onClick={() => onNavigate('/patients')}
                  className={`sidebar-nav-item ${currentPath === '/patients' ? 'active' : ''}`}
                >
                  <User size={19} />
                  <span>Patients List</span>
                </button>
                <button
                  onClick={() => onNavigate('/alerts')}
                  className={`sidebar-nav-item ${currentPath === '/alerts' ? 'active' : ''}`}
                >
                  <ShieldAlert size={19} />
                  <span>Safety Alerts</span>
                </button>
              </>
            )}

            <div style={{ margin: '16px 0 6px 12px', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account & Settings
            </div>

            <button
              onClick={() => onNavigate('/profile')}
              className={`sidebar-nav-item ${currentPath === '/profile' ? 'active' : ''}`}
            >
              <User size={19} />
              <span>{t('profileTitle')}</span>
            </button>

            <button
              onClick={() => onNavigate('/settings')}
              className={`sidebar-nav-item ${currentPath === '/settings' ? 'active' : ''}`}
            >
              <SettingsIcon size={19} />
              <span>{t('settingsTitle')}</span>
            </button>
          </nav>
        </aside>

        {/* Main Content View Container */}
        <main className="main-content" role="main">
          {children}
        </main>
      </div>
    </div>
  );
};
