import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Bell, Clock } from 'lucide-react';
import { getTranslation, Language } from '../i18n/translations';

interface Props {
  lang: Language;
  onBack: () => void;
}

export const RemindersScreen: React.FC<Props> = ({ lang, onBack }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const [statuses, setStatuses] = useState<{ [key: string]: boolean }>({
    '1': true,
    '2': true,
    '3': false,
    '4': false,
  });

  const remindersList = [
    { id: '1', titleKey: 'reminder1' as const, time: '08:00 AM' },
    { id: '2', titleKey: 'reminder2' as const, time: '10:30 AM' },
    { id: '3', titleKey: 'reminder3' as const, time: '04:00 PM' },
    { id: '4', titleKey: 'reminder4' as const, time: '06:00 PM' },
  ];

  const handleToggle = (id: string) => {
    setStatuses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(statuses).filter(Boolean).length;

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}
          aria-label="Go Back"
        >
          <ArrowLeft size={20} /> {t('backToHome')}
        </button>

        <h2 className="text-section-title">{t('remindersTitle')}</h2>

        <span className="badge-pill badge-emerald" style={{ fontSize: '15px' }}>
          {completedCount}/{remindersList.length} Done
        </span>
      </div>

      <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.2)', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={26} color="#F59E0B" />
          </div>
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF' }}>{t('remindersTitle')}</h3>
            <p style={{ fontSize: '15px', color: '#94A3B8' }}>Tap card to toggle reminder status</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {remindersList.map((r) => {
            const isDone = statuses[r.id];
            return (
              <div
                key={r.id}
                onClick={() => handleToggle(r.id)}
                style={{
                  padding: '20px 24px',
                  borderRadius: '20px',
                  background: isDone ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                  border: isDone ? '2px solid #10B981' : '1px solid var(--border-glass-bright)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
              >
                <div>
                  <p style={{ fontSize: '20px', fontWeight: '800', color: '#FFFFFF' }}>{t(r.titleKey)}</p>
                  <span style={{ fontSize: '15px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <Clock size={16} /> {r.time}
                  </span>
                </div>
                {isDone ? (
                  <CheckCircle2 size={32} color="#10B981" />
                ) : (
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #64748B' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
