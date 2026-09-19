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
    String(notificationService.getPermissionStatus())
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

    return () => {
      unsubscribe();
    };
  }, [speak, t, voiceEnabled]);

  const handleEnableNotifications = async () => {
    const perm = await notificationService.requestPermission();
    setNotificationPermission(perm ? 'granted' : 'denied');
    if (perm) {
      showToast('Notifications enabled successfully.', 'success');
    } else {
      showToast('Notification permission denied.', 'error');
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
    const rId = r._id || r.id;
    if (!rId) return;
    setEditingId(rId);
    setFormTitle(r.title);
    setFormDescription(r.description || '');
    setFormType(r.type || 'medicine');
    setFormDate(r.date || new Date().toISOString().split('T')[0]);
    setFormTime(r.time || '09:00');
    setFormRepeat(r.repeat || 'none');
    setIsModalOpen(true);
  };

  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToast('Reminder title is required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await updateReminderApi(editingId, {
          title: formTitle,
          description: formDescription,
          type: formType,
          date: formDate,
          time: formTime,
          repeat: formRepeat,
        });
        if (res.success && res.reminder) {
          setReminders((prev) =>
            prev.map((item) => ((item._id || item.id) === editingId ? res.reminder! : item))
          );
          notificationService.showBrowserNotification(`⏰ MindMate Reminder: ${res.reminder.title}`, { body: res.reminder.description });
          showToast('Reminder updated successfully.', 'success');
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Failed to update reminder.', 'error');
        }
      } else {
        const res = await createReminderApi({
          title: formTitle,
          description: formDescription,
          type: formType,
          date: formDate,
          time: formTime,
          repeat: formRepeat,
          patientId,
        });
        if (res.success && res.reminder) {
          setReminders((prev) => [res.reminder!, ...prev]);
          notificationService.showBrowserNotification(`⏰ MindMate Reminder: ${res.reminder.title}`, { body: res.reminder.description });
          showToast('New reminder created.', 'success');
          setIsModalOpen(false);
        } else {
          showToast(res.error || 'Failed to create reminder.', 'error');
        }
      }
    } catch (err: any) {
      showToast('Network error while saving reminder.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (r: ReminderData) => {
    const rId = r._id || r.id;
    if (!rId) return;
    const nextVal = !r.completed;

    setReminders((prev) =>
      prev.map((item) => ((item._id || item.id) === rId ? { ...item, completed: nextVal } : item))
    );

    try {
      const res = await toggleReminderCompleteApi(rId, nextVal);
      if (res.success && res.reminder) {
        setReminders((prev) =>
          prev.map((item) => ((item._id || item.id) === rId ? res.reminder! : item))
        );
        if (nextVal) {
          showToast('Reminder marked as completed.', 'success');
        }
      } else {
        loadReminders();
      }
    } catch (err) {
      loadReminders();
    }
  };

  const handleToggleActive = async (r: ReminderData, e: React.MouseEvent) => {
    e.stopPropagation();
    const rId = r._id || r.id;
    if (!rId) return;
    const nextActive = !r.isActive;

    setReminders((prev) =>
      prev.map((item) => ((item._id || item.id) === rId ? { ...item, isActive: nextActive } : item))
    );

    try {
      const res = await toggleReminderActiveApi(rId, nextActive);
      if (!res.success) {
        loadReminders();
      }
    } catch (err) {
      loadReminders();
    }
  };

  const handleDelete = async (rId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setReminders((prev) => prev.filter((item) => (item._id || item.id) !== rId));

    try {
      const res = await deleteReminderApi(rId);
      if (res.success) {
        showToast('Reminder deleted.', 'info');
      } else {
        loadReminders();
      }
    } catch (err) {
      loadReminders();
    }
  };

  const getTypeDetails = (type: ReminderData['type']) => {
    switch (type) {
      case 'medicine':
        return { label: 'Medicine', color: '#0284C7', bg: '#E0F2FE', icon: Pill };
      case 'hydration':
        return { label: 'Hydration', color: '#0D9488', bg: '#CCFBF1', icon: Droplets };
      case 'activity':
        return { label: 'Activity', color: '#4F46E5', bg: '#EEF2FF', icon: Brain };
      case 'appointment':
        return { label: 'Appointment', color: '#16A34A', bg: '#DCFCE7', icon: Calendar };
      default:
        return { label: 'General', color: '#D97706', bg: '#FEF3C7', icon: FileText };
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
    <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: '12px',
            background: toastMsg.type === 'error' ? '#BE123C' : toastMsg.type === 'info' ? '#0284C7' : '#15803D',
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 4px 14px rgba(15,23,42,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          {toastMsg.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Due Live Alert Modal */}
      {dueAlertReminder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '460px',
              width: '100%',
              padding: '32px',
              textAlign: 'center',
              border: '2px solid var(--accent-amber)',
              boxShadow: 'var(--shadow-hover)',
              borderRadius: '20px',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--accent-amber-glow)',
                border: '2px solid var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={32} color="var(--accent-amber)" className="pulse-mic" />
            </div>

            <span style={{ fontSize: '13px', color: 'var(--accent-amber)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⏰ REMINDER DUE NOW!
            </span>

            <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {dueAlertReminder.title}
            </h2>

            {dueAlertReminder.description && (
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                {dueAlertReminder.description}
              </p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <Clock size={16} color="var(--accent-amber)" />
              <span>Scheduled for {formatTime12h(dueAlertReminder.time)}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={() => {
                  handleToggleComplete(dueAlertReminder);
                  setDueAlertReminder(null);
                }}
                className="btn-primary btn-emerald"
                style={{ flex: 1, minHeight: '48px', fontSize: '16px', fontWeight: '800' }}
              >
                <Check size={20} /> Mark Done
              </button>
              <button
                onClick={() => setDueAlertReminder(null)}
                className="btn-primary btn-glass-subtle"
                style={{ flex: 1, minHeight: '48px', fontSize: '16px' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 16px', fontSize: '15px' }}
          aria-label={t('backToHome')}
        >
          <ArrowLeft size={18} /> {t('backToHome')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {notificationPermission !== 'granted' ? (
            <button
              onClick={handleEnableNotifications}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '42px', padding: '0 14px', fontSize: '14px', border: '1px solid var(--accent-amber)', color: 'var(--accent-amber)' }}
            >
              <Bell size={16} /> Enable Notifications
            </button>
          ) : (
            <span className="badge-pill badge-emerald" style={{ fontSize: '13px' }}>
              <Bell size={14} /> Notifications Active
            </span>
          )}

          <button
            onClick={handleOpenAddModal}
            className="btn-primary btn-emerald"
            style={{ minHeight: '42px', padding: '0 18px', fontSize: '15px' }}
          >
            <Plus size={18} /> {t('addReminder')}
          </button>
        </div>
      </div>

      {/* 2. Main Reminders Container */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="text-section-title" style={{ margin: 0 }}>
              🔔 {t('remindersTitle')}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {completedCount} of {reminders.length} completed
            </p>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
            {[
              { key: 'today', label: 'Today' },
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'completed', label: 'Completed' },
              { key: 'all', label: 'All' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9px',
                  border: 'none',
                  background: activeTab === tab.key ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === tab.key ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.key ? '700' : '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reminders List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
            Loading reminders...
          </div>
        ) : filteredReminders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <BellOff size={36} color="var(--border-glass-bright)" style={{ marginBottom: '8px' }} />
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>No reminders found in this category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredReminders.map((r) => {
              const rId = r._id || r.id || '';
              const typeInfo = getTypeDetails(r.type);
              const TypeIcon = typeInfo.icon;

              return (
                <div
                  key={rId}
                  style={{
                    background: r.completed ? '#F8FAFC' : '#FFFFFF',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '16px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    opacity: r.completed ? 0.75 : 1,
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button
                      onClick={() => handleToggleComplete(r)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: r.completed ? 'none' : '2px solid var(--border-glass-bright)',
                        background: r.completed ? 'var(--accent-emerald)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title="Toggle completion"
                    >
                      {r.completed && <Check size={18} color="#FFFFFF" />}
                    </button>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            background: typeInfo.bg,
                            color: typeInfo.color,
                            border: `1px solid ${typeInfo.color}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <TypeIcon size={12} /> {typeInfo.label}
                        </span>

                        {r.repeat && r.repeat !== 'none' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Repeat size={12} /> {r.repeat}
                          </span>
                        )}
                      </div>

                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: 'var(--text-primary)',
                          textDecoration: r.completed ? 'line-through' : 'none',
                          margin: '4px 0 2px 0',
                        }}
                      >
                        {r.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: '600' }}>
                          <Clock size={14} /> {formatTime12h(r.time)}
                        </span>
                        <span>{r.date}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {voiceEnabled && (
                      <button
                        onClick={() => speak(`${t('reminderSpokenPrefix')} ${r.title}`, true)}
                        className="btn-primary btn-glass-subtle"
                        style={{ minHeight: '38px', padding: '0 10px', borderRadius: '8px' }}
                        title={t('listenInstructions')}
                      >
                        <Volume2 size={16} color="var(--accent-primary)" />
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenEditModal(r)}
                      className="btn-primary btn-glass-subtle"
                      style={{ minHeight: '38px', padding: '0 10px', borderRadius: '8px' }}
                      title="Edit Reminder"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(rId, r.title, e)}
                      className="btn-primary btn-glass-subtle"
                      style={{ minHeight: '38px', padding: '0 10px', borderRadius: '8px', color: 'var(--accent-rose)' }}
                      title="Delete Reminder"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Add / Edit Reminder Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(6px)',
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
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              borderRadius: '20px',
              border: '1px solid var(--border-glass)',
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {editingId ? 'Edit Reminder' : t('addReminder')}
            </h3>

            <form onSubmit={handleSaveReminder} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                  {t('reminderTitleLabel')}
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Morning Medication"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 14px',
                    borderRadius: '12px',
                    background: '#F8FAFC',
                    border: '1px solid var(--border-glass)',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '6px', fontWeight: '700' }}>
                    {t('reminderTimeLabel')}
                  </label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 12px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid var(--border-glass)',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary btn-emerald"
                  style={{ flex: 1, minHeight: '46px', fontSize: '15px' }}
                >
                  {submitting ? 'Saving...' : t('saveReminder')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-primary btn-glass-subtle"
                  style={{ minHeight: '46px', padding: '0 18px', fontSize: '15px' }}
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
