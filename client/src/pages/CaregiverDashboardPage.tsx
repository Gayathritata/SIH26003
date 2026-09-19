import React from 'react';
import { CaregiverDashboard } from '../components/CaregiverDashboard';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';

interface CaregiverDashboardPageProps {
  user: UserProfile | null;
  onNavigate: (path: string) => void;
  lang: Language;
}

export const CaregiverDashboardPage: React.FC<CaregiverDashboardPageProps> = ({ user, onNavigate, lang }) => {
  return (
    <CaregiverDashboard
      user={user}
      onBackToElderly={() => onNavigate('/dashboard')}
      onNavigateSettings={() => onNavigate('/settings')}
      lang={lang}
    />
  );
};
