import React from 'react';
import { ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { getTranslation, Language } from '../i18n/translations';

interface Props {
  titleKey: Parameters<typeof getTranslation>[1];
  lang: Language;
  onBack: () => void;
}

export const ComingSoonScreen: React.FC<Props> = ({ titleKey, lang, onBack }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto', width: '100%', textAlign: 'center' }}>
      <div className="glass-panel" style={{ padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.2)', border: '2px solid #6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Clock size={40} color="#6366F1" />
        </div>

        <span className="badge-pill badge-amber" style={{ fontSize: '15px', padding: '8px 16px' }}>
          <Sparkles size={16} /> {t('comingSoon')}
        </span>

        <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF' }}>
          {t(titleKey)}
        </h2>

        <p className="text-body-elderly" style={{ color: '#94A3B8', maxWidth: '440px' }}>
          {t('comingSoonMessage')}
        </p>

        <button
          onClick={onBack}
          className="btn-primary btn-emerald"
          style={{ minHeight: '52px', padding: '0 28px', fontSize: '17px', marginTop: '12px' }}
        >
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>
      </div>
    </div>
  );
};
