import React from 'react';
import { LoginScreen } from '../components/auth/LoginScreen';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';

interface LoginPageProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateRegister: () => void;
  onNavigateForgot: () => void;
  lang: Language;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onNavigateRegister, onNavigateForgot, lang }) => {
  return (
    <LoginScreen
      onSuccess={onSuccess}
      onNavigateRegister={onNavigateRegister}
      onNavigateForgot={onNavigateForgot}
      lang={lang}
    />
  );
};
