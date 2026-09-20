import React, { useState, useEffect } from 'react';
import { UserCheck, Trophy, Target, Clock, Activity, RotateCcw, Brain, Calendar, Search, Sparkles, AlertCircle, Bell, BarChart2 } from 'lucide-react';
import { apiClient } from '../services/api';
import { PerformanceCharts } from './caregiver/PerformanceCharts';
import { UserProfile } from '../services/authService';
import { Language } from '../utils/i18n';
import { RemindersScreen } from './RemindersScreen';

interface CaregiverDashboardProps {
  user?: UserProfile | null;
  onBackToElderly: () => void;
  onNavigateSettings?: () => void;
  lang: Language;
}

export const CaregiverDashboard: React.FC<CaregiverDashboardProps> = ({
  user,
  onBackToElderly,
  onNavigateSettings,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reminders'>('analytics');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchCaregiverDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/caregiver/dashboard');
      if (response.data && response.data.success) {
        setDashboardData(response.data);
      } else {
        setError('Could not load caregiver dashboard performance data.');
      }
    } catch (err: any) {
      console.warn('[CAREGIVER DASHBOARD FETCH ERROR]', err);
      if (err.response && err.response.status === 403) {
        setError('Forbidden. Caregiver authorization required to view performance analytics.');
      } else {
        setError('Network error fetching caregiver performance summary.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaregiverDashboardData();
  }, []);

  const getGameTitle = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return '🧠 Memory Match';
    if (type === 'pattern_recognition' || type === 'pattern') return '🔷 Pattern Recognition';
    if (type === 'daily_routine_recall' || type === 'routine') return '📅 Daily Routine Recall';
    if (type === 'object_recognition' || type === 'object_rec') return '👀 Object Recognition';
    return 'Cognitive Game';
  };

  const formatDifficultyLabel = (diff: number) => {
    if (diff === 1) return 'Easy';
    if (diff === 2) return 'Medium';
    if (diff === 3) return 'Hard';
    return `Level ${diff}`;
  };

  const formatDateLabel = (dateStr?: string) => {
    if (!dateStr) return 'Recent';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RotateCcw size={36} className="pulse-mic" color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Loading Caregiver Analytics...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', maxWidth: '560px', margin: '40px auto', background: '#FFFFFF' }}>
        <AlertCircle size={44} color="#BE123C" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>Access Restricted</h3>
        <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px', fontSize: '14px' }}>{error}</p>
        <button onClick={onBackToElderly} className="btn-primary btn-emerald" style={{ minHeight: '44px', padding: '0 20px', fontSize: '15px' }}>
          Back to Main Dashboard
        </button>
      </div>
    );
  }

  const summary = dashboardData?.summary || {
    totalGamesCompleted: 0,
    averageAccuracy: 0,
    averageScore: 0,
    averageCompletionTime: 0,
    averageCompletionRate: 0,
    performanceTrend: 'stable',
    latestAiRecommendedDifficulty: 'Medium',
  };

  const gamesByType = dashboardData?.gamesByType || {};
  const recentSessions = dashboardData?.recentSessions || [];
  const isEmpty = dashboardData?.isEmpty || recentSessions.length === 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* HERO HEADER */}
      <div className="hero-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg, #0284C7, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}>
              <UserCheck size={28} color="#FFFFFF" />
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--accent-teal)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Caregiver Analytics Portal
              </span>
              <h2 className="text-hero-title" style={{ fontSize: '24px', margin: '2px 0 0 0' }}>
                Patient Performance Overview
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={fetchCaregiverDashboardData} className="btn-primary btn-glass-subtle" style={{ minHeight: '40px', padding: '0 14px', fontSize: '14px' }}>
              <RotateCcw size={15} /> Refresh
            </button>
            <button onClick={onBackToElderly} className="btn-primary btn-glass-subtle" style={{ minHeight: '40px', padding: '0 16px', fontSize: '14px' }}>
              Back to Patient View
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid var(--border-glass)', paddingTop: '14px' }}>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'analytics' ? 'var(--accent-primary)' : '#FFFFFF',
              border: activeTab === 'analytics' ? 'none' : '1px solid var(--border-glass)',
              color: activeTab === 'analytics' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <BarChart2 size={16} /> Performance Analytics
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              background: activeTab === 'reminders' ? 'var(--accent-amber)' : '#FFFFFF',
              border: activeTab === 'reminders' ? 'none' : '1px solid var(--border-glass)',
              color: activeTab === 'reminders' ? '#FFFFFF' : 'var(--text-secondary)',
              fontWeight: '700',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Bell size={16} /> Patient Reminders
          </button>
        </div>
      </div>

      {activeTab === 'reminders' ? (
        <RemindersScreen onBack={() => setActiveTab('analytics')} />
      ) : (
        <>
          {/* KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF' }}>
              <Trophy size={22} color="var(--accent-primary)" style={{ margin: '0 auto 6px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Games Completed</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{summary.totalGamesCompleted}</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF' }}>
              <Target size={22} color="#15803D" style={{ margin: '0 auto 6px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Average Accuracy</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: '#15803D' }}>{summary.averageAccuracy}%</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF' }}>
              <Activity size={22} color="var(--accent-teal)" style={{ margin: '0 auto 6px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Average Score</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-teal)' }}>{summary.averageScore}</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF' }}>
              <Clock size={22} color="var(--accent-indigo)" style={{ margin: '0 auto 6px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Avg Time</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-indigo)' }}>{summary.averageCompletionTime}s</span>
            </div>

            <div className="glass-panel" style={{ padding: '16px', textAlign: 'center', background: '#FFFFFF', border: '1px solid #FDE68A' }}>
              <Sparkles size={22} color="var(--accent-amber)" style={{ margin: '0 auto 6px' }} />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Recommended Level</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#B45309' }}>{summary.latestAiRecommendedDifficulty}</span>
            </div>
          </div>

          {/* EMPTY STATE */}
          {isEmpty ? (
            <div
              className="glass-panel"
              style={{
                padding: '40px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                background: '#FFFFFF',
              }}
            >
              <Brain size={44} color="var(--border-glass-bright)" />
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                No Game Sessions Recorded Yet
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
                No completed cognitive sessions found. Encourage your patient to play their first game to see performance insights!
              </p>
            </div>
          ) : (
            <>
              {/* PERFORMANCE CHARTS */}
              <PerformanceCharts sessions={recentSessions} />

              {/* GAME-WISE SUMMARY CARDS */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFFFF' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  🎮 Game-Wise Performance Breakdown
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  {/* Memory Match */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #BAE6FD', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Brain size={18} color="var(--accent-primary)" />
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Memory Match</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>Played: <strong>{gamesByType.memory_match?.count || 0} sessions</strong></span>
                      <span>Avg Accuracy: <strong style={{ color: '#15803D' }}>{gamesByType.memory_match?.avgAccuracy || 0}%</strong></span>
                      <span>Avg Score: <strong>{gamesByType.memory_match?.avgScore || 0}</strong></span>
                    </div>
                  </div>

                  {/* Pattern Recognition */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #FDE68A', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Target size={18} color="var(--accent-amber)" />
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Pattern Recognition</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>Played: <strong>{gamesByType.pattern_recognition?.count || 0} sessions</strong></span>
                      <span>Avg Accuracy: <strong style={{ color: '#15803D' }}>{gamesByType.pattern_recognition?.avgAccuracy || 0}%</strong></span>
                      <span>Avg Score: <strong>{gamesByType.pattern_recognition?.avgScore || 0}</strong></span>
                    </div>
                  </div>

                  {/* Daily Routine Recall */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #C7D2FE', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Calendar size={18} color="var(--accent-indigo)" />
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Routine Recall</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>Played: <strong>{gamesByType.daily_routine_recall?.count || 0} sessions</strong></span>
                      <span>Avg Accuracy: <strong style={{ color: '#15803D' }}>{gamesByType.daily_routine_recall?.avgAccuracy || 0}%</strong></span>
                      <span>Avg Score: <strong>{gamesByType.daily_routine_recall?.avgScore || 0}</strong></span>
                    </div>
                  </div>

                  {/* Object Recognition */}
                  <div style={{ background: '#F8FAFC', border: '1px solid #99F6E4', borderRadius: '14px', padding: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <Search size={18} color="var(--accent-teal)" />
                      <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>Object Recognition</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>Played: <strong>{gamesByType.object_recognition?.count || 0} sessions</strong></span>
                      <span>Avg Accuracy: <strong style={{ color: '#15803D' }}>{gamesByType.object_recognition?.avgAccuracy || 0}%</strong></span>
                      <span>Avg Score: <strong>{gamesByType.object_recognition?.avgScore || 0}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RECENT GAME HISTORY TABLE */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#FFFFFF' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  📜 Recent Game History
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentSessions.map((sess: any, idx: number) => (
                    <div
                      key={sess.id || idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '12px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: 'var(--shadow-soft)',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                          {getGameTitle(sess.gameType)}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {formatDateLabel(sess.completedAt)}
                          </span>
                          <span className="badge-pill badge-emerald" style={{ fontSize: '10px', padding: '1px 6px' }}>
                            {formatDifficultyLabel(sess.difficulty)}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Score</span>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-primary)' }}>{sess.score}</span>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Accuracy</span>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: '#15803D' }}>{sess.accuracy}%</span>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Time</span>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-indigo)' }}>{sess.completionTime}s</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
