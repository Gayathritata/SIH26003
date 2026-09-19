import React from 'react';
import { ForgotPasswordScreen } from '../components/auth/ForgotPasswordScreen';

interface ForgotPasswordPageProps {
  onNavigateLogin: () => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateLogin }) => {
  return <ForgotPasswordScreen onNavigateLogin={onNavigateLogin} />;
};
