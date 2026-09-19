/**
 * Notification Service for MINDMATE NER
 * Handles Browser Notifications (HTML5 Notification API)
 * and In-App Banner Alerts with periodic background checks.
 */

import { ReminderData } from './api';

type InAppNotificationListener = (reminder: ReminderData) => void;

class NotificationService {
  private listeners: Set<InAppNotificationListener> = new Set();
  private notifiedSet: Set<string> = new Set();
  private checkIntervalId: any = null;

  /**
   * Check if browser supports HTML5 notifications
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Get current browser notification permission
   */
  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  /**
   * Request browser notification permission explicitly
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('[NOTIFICATION] Browser notifications not supported on this device.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('[NOTIFICATION] Permission status:', permission);
      return permission === 'granted';
    } catch (err) {
      console.error('[NOTIFICATION] Error requesting permission:', err);
      return false;
    }
  }

  /**
   * Display a browser notification if permission is granted
   */
  public showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (!this.isSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: options?.tag || 'mindmate-reminder',
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (err) {
      console.error('[NOTIFICATION] Failed to display browser notification:', err);
    }
  }

  /**
   * Subscribe to live in-app reminder alerts
   */
  public subscribeInApp(listener: InAppNotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify subscribers of a due reminder (In-App alert)
   */
  private triggerInAppAlert(reminder: ReminderData): void {
    this.listeners.forEach((listener) => {
      try {
        listener(reminder);
      } catch (err) {
        console.error('[NOTIFICATION] Listener error:', err);
      }
    });
  }

  /**
   * Check array of reminders against current time to find due items
   */
  public checkDueReminders(reminders: ReminderData[]): ReminderData[] {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`; // HH:mm

    const dueList: ReminderData[] = [];

    reminders.forEach((r) => {
      if (!r.isActive || r.completed) return;

      const reminderId = r._id || r.id || '';
      // Key format: id_date_time to allow re-notifying daily/weekly occurrences
      const notificationKey = `${reminderId}_${r.date}_${r.time}`;

      if (this.notifiedSet.has(notificationKey)) {
        return; // Already notified for this exact time instance
      }

      // Check if reminder is scheduled for today or repeated
      let isDueToday = r.date === todayStr;

      if (r.repeat === 'daily') {
        isDueToday = true; // Repeats every day
      } else if (r.repeat === 'weekly') {
        const reminderDateObj = new Date(r.date);
        isDueToday = reminderDateObj.getDay() === now.getDay();
      }

      // If due today and the current time matches or slightly passed (within 10-minute window)
      if (isDueToday) {
        const [rHours, rMinutes] = r.time.split(':').map(Number);
        const rTimeInMinutes = rHours * 60 + rMinutes;
        const nowInMinutes = now.getHours() * 60 + now.getMinutes();

        // Check if within 0 to 10 minutes past scheduled time
        if (nowInMinutes >= rTimeInMinutes && nowInMinutes <= rTimeInMinutes + 10) {
          dueList.push(r);
          this.notifiedSet.add(notificationKey);

          // Fire notifications
          const title = `⏰ MindMate Reminder: ${r.title}`;
          const body = r.description ? r.description : `Time for your ${r.type} task!`;

          this.showBrowserNotification(title, {
            body,
            tag: notificationKey,
          });

          this.triggerInAppAlert(r);
        }
      }
    });

    return dueList;
  }

  /**
   * Start periodic checker loop
   */
  public startChecking(fetchRemindersFn: () => Promise<ReminderData[]>): void {
    if (this.checkIntervalId) return;

    const performCheck = async () => {
      try {
        const reminders = await fetchRemindersFn();
        if (Array.isArray(reminders)) {
          this.checkDueReminders(reminders);
        }
      } catch (err) {
        console.warn('[NOTIFICATION] Background check failed:', err);
      }
    };

    // Run initial check after 2 seconds
    setTimeout(performCheck, 2000);

    // Run check every 30 seconds
    this.checkIntervalId = setInterval(performCheck, 30000);
  }

  /**
   * Stop background checking
   */
  public stopChecking(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  /**
   * Reset notification cache (e.g. on logout)
   */
  public clearCache(): void {
    this.notifiedSet.clear();
  }
}

export const notificationService = new NotificationService();
