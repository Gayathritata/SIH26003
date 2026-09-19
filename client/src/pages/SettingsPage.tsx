import React from 'react';
import { SettingsScreen } from '../components/SettingsScreen';
import { UserProfile } from '../services/authService';

interface SettingsPageProps {
  user: UserProfile | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onNavigate,
  onLogout,
}) => {
  const defaultHome = user?.role === 'caregiver' || user?.role === 'admin' ? '/caregiver' : '/dashboard';

  return (
    <SettingsScreen
      onBack={() => onNavigate(defaultHome)}
      onLogout={onLogout}
    />
  );
};
