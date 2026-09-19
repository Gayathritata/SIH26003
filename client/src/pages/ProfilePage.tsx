import React from 'react';
import { ProfileScreen } from '../components/ProfileScreen';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';

interface ProfilePageProps {
  user: UserProfile | null;
  lang: Language;
  onNavigate: (path: string) => void;
  onLanguageChange: (lang: Language) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, lang, onNavigate, onLanguageChange }) => {
  const defaultHome = user?.role === 'caregiver' || user?.role === 'admin' ? '/caregiver' : '/dashboard';

  return (
    <ProfileScreen
      user={user}
      lang={lang}
      onBack={() => onNavigate(defaultHome)}
      onLanguageChange={onLanguageChange}
    />
  );
};
