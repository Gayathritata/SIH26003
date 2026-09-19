import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Bell,
  Clock,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  AlertCircle,
  Pill,
  Droplets,
  Brain,
  FileText,
  Repeat,
  BellOff,
  Check,
  Volume2,
} from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import {
  ReminderData,
  fetchRemindersApi,
  createReminderApi,
  updateReminderApi,
  deleteReminderApi,
  toggleReminderCompleteApi,
  toggleReminderActiveApi,
} from '../services/api';
import { notificationService } from '../services/notificationService';

interface Props {
  onBack: () => void;
  patientId?: string;
}

export const RemindersScreen: React.FC<Props> = ({ onBack, patientId }) => {
  const { t, speak, voiceEnabled } = useAccessibility();

  const [reminders, setReminders] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formType, setFormType] = useState<ReminderData['type']>('medicine');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formTime, setFormTime] = useState<string>('09:00');
  const [formRepeat, setFormRepeat] = useState<ReminderData['repeat']>('none');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const [notificationPermission, setNotificationPermission] = useState<string>(
    notificationService.getPermissionStatus()
  );

  const [dueAlertReminder, setDueAlertReminder] = useState<ReminderData | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg(null);
    }, 3500);
  };

  const loadReminders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRemindersApi(patientId);
      if (res.success && Array.isArray(res.reminders)) {
        setReminders(res.reminders);
      } else {
        setError(res.error || 'Failed to load reminders from backend.');
      }
    } catch (err: any) {
      console.error('[REMINDERS LOAD ERROR]', err);
      setError('Network error while loading reminders.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeInApp((reminder) => {
      setDueAlertReminder(reminder);
      if (voiceEnabled) {
        speak(`${t('reminderSpokenPrefix')} ${reminder.title}`, true);
      }
    });

    notificationService.startChecking(async () => {
      const res = await fetchRemindersApi(patientId);
      return res.success && Array.isArray(res.reminders) ? res.reminders : [];
    });

    return () => {
      unsubscribe();
      notificationService.stopChecking();
    };
  }, [patientId, voiceEnabled]);

  const handleEnableNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(notificationService.getPermissionStatus());
    if (granted) {
      showToast('Browser notifications enabled!', 'success');
    } else {
      showToast('Notification permission denied.', 'info');
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormType('medicine');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormTime('09:00');
    setFormRepeat('none');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (r: ReminderData) => {
    setEditingId(r._id || r.id || null);
    setFormTitle(r.title);
    setFormDescription(r.description || '');
    setFormType(r.type);
    setFormDate(r.date);
    setFormTime(r.time);
    setFormRepeat(r.repeat || 'none');
    setIsModalOpen(true);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Please enter a title for your reminder.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<ReminderData> = {
        title: formTitle.trim(),
        description: formDescription.trim(),
        type: formType,
        date: formDate,
        time: formTime,
        repeat: formRepeat,
      };

      if (editingId) {
        const res = await updateReminderApi(editingId, payload);
        if (res.success) {
          showToast('Reminder updated successfully!', 'success');
          setIsModalOpen(false);
          loadReminders();
        } else {
          showToast(res.error || 'Failed to update reminder.', 'error');
        }
      } else {
        const res = await createReminderApi(payload);
        if (res.success) {
          showToast('Reminder created successfully!', 'success');
          setIsModalOpen(false);
          loadReminders();
        } else {
          showToast(res.error || 'Failed to create reminder.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Error saving reminder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (r: ReminderData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = r._id || r.id;
    if (!id) return;

    const newCompleted = !r.completed;
    setReminders((prev) =>
      prev.map((item) => ((item._id === id || item.id === id) ? { ...item, completed: newCompleted } : item))
    );

    const res = await toggleReminderCompleteApi(id, newCompleted);
    if (res.success) {
      showToast(newCompleted ? 'Task completed! 🎉' : 'Task marked incomplete.', 'success');
      loadReminders();
    } else {
      showToast(res.error || 'Failed to update reminder status.', 'error');
      loadReminders();
    }
  };

  const handleToggleActive = async (r: ReminderData, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = r._id || r.id;
    if (!id) return;

    const newActive = !r.isActive;
    setReminders((prev) =>
      prev.map((item) => ((item._id === id || item.id === id) ? { ...item, isActive: newActive } : item))
    );

    const res = await toggleReminderActiveApi(id, newActive);
    if (res.success) {
      showToast(newActive ? 'Reminder activated.' : 'Reminder paused.', 'info');
      loadReminders();
    } else {
      showToast(res.error || 'Failed to toggle reminder state.', 'error');
      loadReminders();
    }
  };

  const handleDelete = async (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Delete "${title}"?`)) {
      return;
    }

    const res = await deleteReminderApi(id);
    if (res.success) {
      showToast('Reminder deleted.', 'info');
      loadReminders();
    } else {
      showToast(res.error || 'Failed to delete reminder.', 'error');
    }
  };

  const getTypeBadge = (type: ReminderData['type']) => {
    switch (type) {
      case 'medicine':
        return { label: 'Medicine', color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.15)', icon: Pill };
      case 'hydration':
        return { label: 'Hydration', color: '#0EA5E9', bg: 'rgba(14, 165, 233, 0.15)', icon: Droplets };
      case 'activity':
        return { label: 'Activity', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', icon: Brain };
      case 'appointment':
        return { label: 'Appointment', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', icon: Calendar };
      default:
        return { label: 'General', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', icon: FileText };
    }
  };

  const formatTime12h = (time24: string) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReminders = reminders.filter((r) => {
    if (activeTab === 'completed') {
      return r.completed;
    }
    if (activeTab === 'today') {
      return !r.completed && (r.date === todayStr || r.repeat === 'daily');
    }
    if (activeTab === 'upcoming') {
      return !r.completed && r.date > todayStr;
    }
    return true;
  });

  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '16px 24px',
            borderRadius: '16px',
            background: toastMsg.type === 'error' ? '#EF4444' : toastMsg.type === 'info' ? '#3B82F6' : '#10B981',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {toastMsg.type === 'error' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Due Reminder Live Modal Alert */}
      {dueAlertReminder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '36px',
              textAlign: 'center',
              border: '3px solid #F59E0B',
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={40} color="#F59E0B" className="pulse-mic" />
            </div>

            <span style={{ fontSize: '14px', color: '#FCD34D', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⏰ REMINDER DUE NOW!
            </span>

            <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              {dueAlertReminder.title}
            </h2>

            {dueAlertReminder.description && (
              <p style={{ fontSize: '18px', color: '#CBD5E1', margin: 0 }}>
                {dueAlertReminder.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', color: '#94A3B8' }}>
              <Clock size={20} color="#F59E0B" />
              <span>Scheduled for {formatTime12h(dueAlertReminder.time)}</span>
            </div>

            <div style={{ display: 'flex', gap: '14px', width: '100%', marginTop: '10px' }}>
              <button
                onClick={() => {
                  handleToggleComplete(dueAlertReminder);
                  setDueAlertReminder(null);
                }}
                className="btn-primary btn-emerald"
                style={{ flex: 1, minHeight: '56px', fontSize: '18px', fontWeight: '800' }}
              >
                <Check size={24} /> Mark Done
              </button>
              <button
                onClick={() => setDueAlertReminder(null)}
                className="btn-primary btn-glass-subtle"
                style={{ flex: 1, minHeight: '56px', fontSize: '18px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Navigation Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <button
          onClick={onBack}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '52px', padding: '0 20px', fontSize: '18px' }}
          aria-label={t('backToHome')}
        >
          <ArrowLeft size={22} /> {t('backToHome')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleEnableNotifications}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '52px', padding: '0 18px', fontSize: '16px', border: '1px solid #F59E0B', color: '#FCD34D' }}
            >
              <Bell size={20} color="#F59E0B" /> Enable Notifications
            </button>
          ) : (
            <span
              className="badge-pill"
              style={{
                fontSize: '14px',
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#6EE7B7',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Bell size={16} /> Notifications Active
            </span>
          )}

          <button
            onClick={handleOpenAddModal}
            className="btn-primary btn-emerald"
            style={{ minHeight: '52px', padding: '0 24px', fontSize: '18px', fontWeight: '800' }}
          >
            <Plus size={24} /> {t('addReminder')}
          </button>
        </div>
      </div>

      {/* 2. Non-Medical Disclaimer Banner */}
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          color: '#FCD34D',
        }}
      >
        <AlertCircle size={22} color="#F59E0B" style={{ flexShrink: 0 }} />
        <span>
          <strong>Disclaimer:</strong> {t('disclaimer')}
        </span>
      </div>

      {/* 3. Main Dashboard Card */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Title & Count Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={28} color="#F59E0B" />
            </div>
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                {t('remindersTitle')}
              </h2>
            </div>
          </div>

          <div className="badge-pill badge-emerald" style={{ fontSize: '16px', padding: '6px 16px' }}>
            {completedCount} / {reminders.length} Completed
          </div>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            borderBottom: '1px solid var(--border-glass-bright)',
            paddingBottom: '12px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'today', label: "Today's Tasks", icon: Clock },
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'completed', label: 'Completed', icon: CheckCircle2 },
            { id: 'all', label: 'All Tasks', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '14px',
                  border: isActive ? '2px solid #EC4899' : '1px solid transparent',
                  background: isActive ? 'rgba(236, 72, 153, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                  color: isActive ? '#FFFFFF' : '#94A3B8',
                  fontSize: '16px',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={18} color={isActive ? '#EC4899' : '#94A3B8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Reminders List */}
        {!loading && !error && filteredReminders.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredReminders.map((r) => {
              const typeInfo = getTypeBadge(r.type);
              const TypeIcon = typeInfo.icon;
              const rId = r._id || r.id || '';

              return (
                <div
                  key={rId}
                  style={{
                    padding: '24px',
                    borderRadius: '20px',
                    background: r.completed
                      ? 'rgba(16, 185, 129, 0.08)'
                      : !r.isActive
                      ? 'rgba(15, 23, 42, 0.5)'
                      : 'rgba(255, 255, 255, 0.04)',
                    border: r.completed
                      ? '2px solid #10B981'
                      : !r.isActive
                      ? '1px dashed #475569'
                      : '1px solid var(--border-glass-bright)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <button
                      onClick={(e) => handleToggleComplete(r, e)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        marginTop: '2px',
                      }}
                      title={r.completed ? 'Mark Incomplete' : 'Mark Completed'}
                    >
                      {r.completed ? (
                        <CheckCircle2 size={36} color="#10B981" />
                      ) : (
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '3px solid #64748B',
                          }}
                        />
                      )}
                    </button>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '800',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            background: typeInfo.bg,
                            color: typeInfo.color,
                            border: `1px solid ${typeInfo.color}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <TypeIcon size={14} /> {typeInfo.label}
                        </span>

                        {r.repeat && r.repeat !== 'none' && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#CBD5E1',
                              background: 'rgba(255,255,255,0.08)',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Repeat size={12} /> Repeats {r.repeat}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '22px',
                          fontWeight: '800',
                          color: r.completed ? '#94A3B8' : '#FFFFFF',
                          textDecoration: r.completed ? 'line-through' : 'none',
                          margin: 0,
                        }}
                      >
                        {r.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: '#6EE7B7', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={16} color="#10B981" />
                          <strong>{formatTime12h(r.time)}</strong>
                        </span>

                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94A3B8' }}>
                          <Calendar size={15} />
                          {r.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {voiceEnabled && (
                      <button
                        onClick={() => speak(`${t('reminderSpokenPrefix')} ${r.title}`, true)}
                        className="btn-primary btn-glass-subtle"
                        style={{ minHeight: '44px', padding: '0 12px', color: '#F472B6', border: '1px solid #EC4899' }}
                        title={t('listenInstructions')}
                      >
                        <Volume2 size={18} />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleToggleActive(r, e)}
                      className="btn-primary btn-glass-subtle"
                      style={{
                        minHeight: '44px',
                        padding: '0 14px',
                        fontSize: '14px',
                        color: r.isActive ? '#94A3B8' : '#F59E0B',
                      }}
                      title={r.isActive ? 'Pause Reminder' : 'Resume Reminder'}
                    >
                      {r.isActive ? 'Pause' : 'Resume'}
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="btn-primary btn-glass-subtle"
                      style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px' }}
                      title="Edit Reminder"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(rId, r.title, e)}
                      className="btn-primary btn-glass-subtle"
                      style={{ minHeight: '44px', padding: '0 14px', fontSize: '14px', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.4)' }}
                      title="Delete Reminder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Reminder Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(8px)',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              borderRadius: '24px',
              border: '2px solid rgba(236, 72, 153, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              {editingId ? 'Edit Reminder' : t('addReminder')}
            </h3>

            <form onSubmit={handleSaveReminder} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  {t('reminderTitleLabel')}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Morning Medication"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid var(--border-glass)',
                    color: '#FFFFFF',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-glass)',
                      color: '#FFFFFF',
                      fontSize: '15px',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '14px', color: '#CBD5E1', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                    {t('reminderTimeLabel')}
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    style={{
                      width: '100%',
                      minHeight: '48px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid var(--border-glass)',
                      color: '#FFFFFF',
                      fontSize: '15px',
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary btn-emerald"
                  style={{ flex: 1, minHeight: '52px', fontSize: '17px', borderRadius: '14px' }}
                >
                  {submitting ? 'Saving...' : t('saveReminder')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-primary btn-glass-subtle"
                  style={{ minHeight: '52px', padding: '0 20px', fontSize: '16px', borderRadius: '14px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
