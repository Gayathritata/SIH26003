import React from 'react';
import { RemindersScreen } from '../components/RemindersScreen';

interface RemindersPageProps {
  onNavigate: (path: string) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({ onNavigate }) => {
  return (
    <RemindersScreen
      onBack={() => onNavigate('/dashboard')}
    />
  );
};
