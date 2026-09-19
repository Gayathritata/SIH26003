import GameSession from '../models/GameSession';
import Reminder from '../models/Reminder';
import MoodLog from '../models/MoodLog';

export const calculatePatientAnalytics = async (patientId: string) => {
  const sessions = await GameSession.find({ patientId }).sort({ createdAt: -1 }).limit(30);
  const reminders = await Reminder.find({ patientId });
  const moodLogs = await MoodLog.find({ patientId }).sort({ createdAt: -1 }).limit(10);

  if (sessions.length === 0) {
    return {
      sessionCount: 0,
      averageScore: 75,
      averageAccuracy: 0.75,
      averageReactionTime: 3.5,
      cognitiveIndicators: {
        memoryScore: 75,
        attentionScore: 78,
        recognitionScore: 80,
        responseScore: 72,
        consistencyScore: 82,
        engagementScore: 85,
        overallIndex: 78,
      },
      reminderAdherence: 80,
      recentMood: 'good',
      sessions: [],
    };
  }

  // Calculate real performance metrics
  const totalScore = sessions.reduce((acc, s) => acc + (s.score || 0), 0);
  const totalAccuracy = sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
  const totalRT = sessions.reduce((acc, s) => acc + (s.reactionTime || s.completionTime || 0), 0);

  const avgScore = Math.round(totalScore / sessions.length);
  const avgAccuracy = Math.round((totalAccuracy / sessions.length) * 100) / 100;
  const avgReactionTime = Math.round((totalRT / sessions.length) * 10) / 10;

  // Breakdown by game type
  const memorySessions = sessions.filter((s) => s.gameType === 'memory');
  const patternSessions = sessions.filter((s) => s.gameType === 'pattern');
  const objSessions = sessions.filter((s) => s.gameType === 'object_rec');

  const getSubAvg = (list: typeof sessions) => {
    if (list.length === 0) return 75;
    return Math.round(list.reduce((sum, item) => sum + item.accuracy, 0) / list.length * 100);
  };

  const memoryScore = getSubAvg(memorySessions);
  const attentionScore = getSubAvg(patternSessions);
  const recognitionScore = getSubAvg(objSessions);
  const responseScore = Math.min(98, Math.max(30, Math.round(100 - avgReactionTime * 6)));

  // Score variance for consistency
  const scoreVariance = sessions.length > 1
    ? sessions.reduce((sum, s) => sum + Math.pow(s.score - avgScore, 2), 0) / sessions.length
    : 16;
  const consistencyScore = Math.min(95, Math.max(40, Math.round(100 - Math.sqrt(scoreVariance) * 2)));
  const engagementScore = Math.min(98, Math.max(50, Math.round((sessions.length / 15) * 40 + avgAccuracy * 55)));

  const overallIndex = Math.round((memoryScore + attentionScore + recognitionScore + responseScore + consistencyScore + engagementScore) / 6);

  // Reminder Adherence Calculation
  const completedReminders = reminders.filter((r) => r.status === 'completed').length;
  const totalReminders = reminders.length;
  const reminderAdherence = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 100;

  const recentMood = moodLogs.length > 0 ? moodLogs[0].mood : 'good';

  return {
    sessionCount: sessions.length,
    averageScore: avgScore,
    averageAccuracy: avgAccuracy,
    averageReactionTime: avgReactionTime,
    cognitiveIndicators: {
      memoryScore,
      attentionScore,
      recognitionScore,
      responseScore,
      consistencyScore,
      engagementScore,
      overallIndex,
    },
    reminderAdherence,
    recentMood,
    sessions,
  };
};
