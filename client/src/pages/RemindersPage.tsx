import React from 'react';
import { RemindersScreen } from '../components/RemindersScreen';
import { Language } from '../utils/i18n';

interface RemindersPageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export const RemindersPage: React.FC<RemindersPageProps> = ({ lang, onNavigate }) => {
  return (
    <RemindersScreen
      lang={lang}
      onBack={() => onNavigate('/dashboard')}
    />
  );
};
