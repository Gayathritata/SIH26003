import React from 'react';
import { Globe, Type, Mic, LogOut, ArrowLeft, Check } from 'lucide-react';
import { getTranslation, Language } from '../i18n/translations';
import { authService } from '../services/authService';

interface Props {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  onTextSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  onBack: () => void;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  lang,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  voiceEnabled,
  onVoiceToggle,
  onBack,
  onLogout,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

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

        <h2 className="text-section-title">{t('settingsTitle')}</h2>

        <div style={{ width: '48px' }} />
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '32px' }}>
        {/* Setting 1: Language Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Globe size={22} color="#10B981" /> {t('languageSetting')}
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी (Hindi)' },
              { code: 'as', label: 'অসমীয়া (Assamese)' },
            ].map((l) => (
              <button
                key={l.code}
                onClick={() => onLanguageChange(l.code as Language)}
                style={{
                  minHeight: '56px',
                  padding: '12px 18px',
                  borderRadius: '16px',
                  border: lang === l.code ? '2px solid #10B981' : '1px solid var(--border-glass)',
                  background: lang === l.code ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: lang === l.code ? '#6EE7B7' : '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '17px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                aria-pressed={lang === l.code}
              >
                {l.label}
                {lang === l.code && <Check size={20} color="#10B981" />}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Text Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
          <label style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Type size={22} color="#F59E0B" /> {t('textSizeSetting')}
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {[
              { key: 'normal', labelKey: 'textSizeNormal' as const },
              { key: 'large', labelKey: 'textSizeLarge' as const },
              { key: 'xlarge', labelKey: 'textSizeXLarge' as const },
            ].map((ts) => (
              <button
                key={ts.key}
                onClick={() => onTextSizeChange(ts.key as any)}
                style={{
                  minHeight: '56px',
                  padding: '12px',
                  borderRadius: '16px',
                  border: textSize === ts.key ? '2px solid #F59E0B' : '1px solid var(--border-glass)',
                  background: textSize === ts.key ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: textSize === ts.key ? '#FCD34D' : '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '17px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                aria-pressed={textSize === ts.key}
              >
                {t(ts.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Setting 3: Voice Assistance Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
          <div>
            <label style={{ fontSize: '18px', fontWeight: '700', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mic size={22} color="#14B8A6" /> {t('voiceAssistanceSetting')}
            </label>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
              {voiceEnabled ? t('voiceEnabled') : t('voiceDisabled')}
            </p>
          </div>

          <button
            onClick={() => onVoiceToggle(!voiceEnabled)}
            style={{
              minHeight: '52px',
              padding: '0 24px',
              borderRadius: '26px',
              border: 'none',
              background: voiceEnabled ? 'linear-gradient(135deg, #14B8A6, #0D9488)' : 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: voiceEnabled ? '0 0 16px rgba(20, 184, 166, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {voiceEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Setting 4: Logout via Firebase Auth */}
        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              minHeight: '60px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(225, 29, 72, 0.2))',
              border: '1px solid #F43F5E',
              color: '#FDA4AF',
              fontSize: '18px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(244, 63, 94, 0.2)',
              transition: 'all 0.2s ease',
            }}
            aria-label="Logout from app"
          >
            <LogOut size={22} /> {t('logoutButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
