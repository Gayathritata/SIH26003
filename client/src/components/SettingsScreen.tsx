import React from 'react';
import { Globe, Type, Mic, LogOut, ArrowLeft, Check, Eye } from 'lucide-react';
import { Language } from '../i18n';
import { useAccessibility } from '../context/AccessibilityContext';

interface Props {
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ onBack, onLogout }) => {
  const {
    lang,
    setLang,
    textSize,
    setTextSize,
    voiceEnabled,
    setVoiceEnabled,
    highContrast,
    setHighContrast,
    t,
  } = useAccessibility();

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

        <h2 className="text-section-title">{t('settingsTitle')}</h2>

        <div style={{ width: '40px' }} />
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '28px', background: '#FFFFFF' }}>
        {/* Setting 1: Language Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <label style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="var(--accent-primary)" /> {t('languageSetting')}
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'as', label: 'অসমীয়া (Assamese)' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code as Language)}
                style={{
                  minHeight: '48px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: lang === l.code ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                  background: lang === l.code ? 'var(--accent-primary-glow)' : '#F8FAFC',
                  color: lang === l.code ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                aria-pressed={lang === l.code}
              >
                {l.label}
                {lang === l.code && <Check size={18} color="var(--accent-primary)" />}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Text Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <label style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Type size={18} color="var(--accent-amber)" /> {t('textSizeSetting')}
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { key: 'normal', labelKey: 'textSizeNormal' as const },
              { key: 'large', labelKey: 'textSizeLarge' as const },
              { key: 'xlarge', labelKey: 'textSizeXLarge' as const },
            ].map((ts) => (
              <button
                key={ts.key}
                onClick={() => setTextSize(ts.key as any)}
                style={{
                  minHeight: '48px',
                  padding: '10px',
                  borderRadius: '12px',
                  border: textSize === ts.key ? '2px solid var(--accent-amber)' : '1px solid var(--border-glass)',
                  background: textSize === ts.key ? 'var(--accent-amber-glow)' : '#F8FAFC',
                  color: textSize === ts.key ? 'var(--accent-amber)' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s ease',
                }}
                aria-pressed={textSize === ts.key}
              >
                {t(ts.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: High Contrast Mode */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <div>
            <label style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={18} color="var(--accent-indigo)" /> {t('highContrastSetting')}
            </label>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {highContrast ? t('highContrastEnabled') : t('highContrastDisabled')}
            </p>
          </div>

          <button
            onClick={() => setHighContrast(!highContrast)}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              borderRadius: '22px',
              border: 'none',
              background: highContrast ? 'var(--accent-indigo)' : '#F1F5F9',
              color: highContrast ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {highContrast ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Setting 4: Voice Assistance Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <div>
            <label style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mic size={18} color="var(--accent-teal)" /> {t('voiceAssistanceSetting')}
            </label>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {voiceEnabled ? t('voiceEnabled') : t('voiceDisabled')}
            </p>
          </div>

          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              minHeight: '44px',
              padding: '0 20px',
              borderRadius: '22px',
              border: 'none',
              background: voiceEnabled ? 'var(--accent-teal)' : '#F1F5F9',
              color: voiceEnabled ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Setting 5: Logout */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              minHeight: '48px',
              borderRadius: '14px',
              background: '#FFE4E6',
              border: '1px solid #FECDD3',
              color: '#BE123C',
              fontSize: '16px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            aria-label="Logout from app"
          >
            <LogOut size={18} /> {t('logoutButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
