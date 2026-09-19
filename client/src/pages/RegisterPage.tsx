import React from 'react';
import { RegisterScreen } from '../components/auth/RegisterScreen';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';

interface RegisterPageProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateLogin: () => void;
  lang: Language;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onSuccess, onNavigateLogin, lang }) => {
  return (
    <RegisterScreen
      onSuccess={onSuccess}
      onNavigateLogin={onNavigateLogin}
      lang={lang}
    />
  );
};
