import React from 'react';
import { ProfileScreen } from '../components/ProfileScreen';
import { UserProfile } from '../services/authService';

interface ProfilePageProps {
  user: UserProfile | null;
  onNavigate: (path: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate }) => {
  const defaultHome = user?.role === 'caregiver' || user?.role === 'admin' ? '/caregiver' : '/dashboard';

  return (
    <ProfileScreen
      user={user}
      onBack={() => onNavigate(defaultHome)}
    />
  );
};
