import React from 'react';
import { SettingsScreen } from '../components/SettingsScreen';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';

interface SettingsPageProps {
  user: UserProfile | null;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  textSize: 'normal' | 'large' | 'xlarge';
  onTextSizeChange: (size: 'normal' | 'large' | 'xlarge') => void;
  voiceEnabled: boolean;
  onVoiceToggle: (enabled: boolean) => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  lang,
  onLanguageChange,
  textSize,
  onTextSizeChange,
  voiceEnabled,
  onVoiceToggle,
  onNavigate,
  onLogout,
}) => {
  const defaultHome = user?.role === 'caregiver' || user?.role === 'admin' ? '/caregiver' : '/dashboard';

  return (
    <SettingsScreen
      lang={lang}
      onLanguageChange={onLanguageChange}
      textSize={textSize}
      onTextSizeChange={onTextSizeChange}
      voiceEnabled={voiceEnabled}
      onVoiceToggle={onVoiceToggle}
      onBack={() => onNavigate(defaultHome)}
      onLogout={onLogout}
    />
  );
};
