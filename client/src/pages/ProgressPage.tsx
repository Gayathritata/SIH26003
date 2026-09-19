import React from 'react';
import { ComingSoonScreen } from '../components/ComingSoonScreen';
import { Language } from '../utils/i18n';

interface ProgressPageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ lang, onNavigate }) => {
  return (
    <ComingSoonScreen
      titleKey="myProgress"
      lang={lang}
      onBack={() => onNavigate('/dashboard')}
    />
  );
};
