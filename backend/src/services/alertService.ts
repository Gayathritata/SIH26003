import Alert from '../models/Alert';
import GameSession from '../models/GameSession';
import Reminder from '../models/Reminder';
import User from '../models/User';
import { getMLPerformanceAnalysis } from './mlClient';

export const checkAndUpdatePatientAlerts = async (patientId: string) => {
  const patientUser = await User.findOne({ firebaseUid: patientId });
  const patientName = patientUser ? patientUser.name : 'Patient';

  const sessions = await GameSession.find({ patientId }).sort({ createdAt: -1 });

  if (sessions.length >= 2) {
    const todaySession = sessions[0];
    const previousSessions = sessions.slice(1, 10);
    const baselineScore = previousSessions.reduce((sum, s) => sum + s.score, 0) / previousSessions.length;

    const analysis = await getMLPerformanceAnalysis(baselineScore, todaySession.score, patientName);

    if (analysis.alert_triggered) {
      // Check if active performance alert already exists today to avoid duplicate alerts
      const existingAlert = await Alert.findOne({
        patientId,
        alertType: 'performance_change',
        status: 'active',
      });

      if (!existingAlert) {
        await Alert.create({
          patientId,
          alertType: 'performance_change',
          message: analysis.message,
          severity: analysis.severity === 'high' ? 'high' : 'medium',
          status: 'active',
        });
      }
    }
  }

  // Check incomplete medicine reminders
  const missedReminders = await Reminder.find({
    patientId,
    status: 'missed',
  });

  if (missedReminders.length >= 2) {
    const existingReminderAlert = await Alert.findOne({
      patientId,
      alertType: 'reminder_incomplete',
      status: 'active',
    });

    if (!existingReminderAlert) {
      await Alert.create({
        patientId,
        alertType: 'reminder_incomplete',
        message: `${missedReminders.length} scheduled medication/activity reminders are currently incomplete for ${patientName}.`,
        severity: 'medium',
        status: 'active',
      });
    }
  }
};
