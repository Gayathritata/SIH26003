import React from 'react';
import { ElderlyHomeScreen } from '../components/ElderlyHomeScreen';
import { UserProfile } from '../services/authService';

interface ElderlyDashboardPageProps {
  user: UserProfile | null;
  difficulty: number;
  selectedMood: string | null;
  onSelectMood: (mood: string) => void;
  onNavigate: (path: string) => void;
  onTriggerVoice: () => void;
}

export const ElderlyDashboardPage: React.FC<ElderlyDashboardPageProps> = ({
  user,
  difficulty,
  selectedMood,
  onSelectMood,
  onNavigate,
  onTriggerVoice,
}) => {
  return (
    <ElderlyHomeScreen
      user={user}
      difficulty={difficulty}
      selectedMood={selectedMood}
      onSelectMood={onSelectMood}
      onNavigate={(dest) => {
        if (dest === 'games') onNavigate('/games');
        else if (dest === 'reminders') onNavigate('/reminders');
        else if (dest === 'my_progress') onNavigate('/progress');
        else if (dest === 'profile') onNavigate('/profile');
        else if (dest === 'settings') onNavigate('/settings');
      }}
      onTriggerVoice={onTriggerVoice}
    />
  );
};
