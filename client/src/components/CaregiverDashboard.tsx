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
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <RotateCcw size={40} className="pulse-anim" color="#10B981" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '20px', color: '#FFFFFF' }}>Loading Caregiver Analytics...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
        <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF' }}>Access Restricted</h3>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0 24px' }}>{error}</p>
        <button onClick={onBackToElderly} className="btn-primary btn-emerald" style={{ minHeight: '48px', padding: '0 24px' }}>
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
    <div style={{ maxWidth: '950px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. CAREGIVER HERO HEADER */}
      <div className="hero-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '20px', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(16, 185, 129, 0.4)' }}>
              <UserCheck size={32} color="#FFFFFF" />
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#6EE7B7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Caregiver Performance Analytics
              </span>
              <h2 className="text-hero-title" style={{ fontSize: '28px', margin: '4px 0 0 0' }}>
                Patient Performance Dashboard
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={fetchCaregiverDashboardData} className="btn-primary btn-glass-subtle" style={{ minHeight: '44px', padding: '0 16px', fontSize: '14px' }}>
              <RotateCcw size={16} /> Refresh
            </button>
            <button onClick={onBackToElderly} className="btn-primary btn-glass-subtle" style={{ minHeight: '44px', padding: '0 18px', fontSize: '14px' }}>
              Back to Patient View
            </button>
          </div>
        </div>

        {/* CAREGIVER DASHBOARD TABS */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', borderTop: '1px solid var(--border-glass-subtle)', paddingTop: '16px' }}>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: activeTab === 'analytics' ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === 'analytics' ? 'none' : '1px solid var(--border-glass-bright)',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'analytics' ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 'none',
            }}
          >
            <BarChart2 size={20} /> Performance Analytics
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: activeTab === 'reminders' ? 'linear-gradient(135deg, #F59E0B, #D97706)' : 'rgba(255, 255, 255, 0.05)',
              border: activeTab === 'reminders' ? 'none' : '1px solid var(--border-glass-bright)',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'reminders' ? '0 4px 16px rgba(245, 158, 11, 0.4)' : 'none',
            }}
          >
            <Bell size={20} /> Patient Reminders & Schedule
          </button>
        </div>
      </div>

      {activeTab === 'reminders' ? (
        <RemindersScreen onBack={() => setActiveTab('analytics')} />
      ) : (
        <>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Trophy size={26} color="#EC4899" style={{ margin: '0 auto 8px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Games Completed</span>
          <span style={{ fontSize: '26px', fontWeight: '800', color: '#FFFFFF' }}>{summary.totalGamesCompleted}</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Target size={26} color="#10B981" style={{ margin: '0 auto 8px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Average Accuracy</span>
          <span style={{ fontSize: '26px', fontWeight: '800', color: '#6EE7B7' }}>{summary.averageAccuracy}%</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Activity size={26} color="#F472B6" style={{ margin: '0 auto 8px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Average Score</span>
          <span style={{ fontSize: '26px', fontWeight: '800', color: '#F472B6' }}>{summary.averageScore}</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
          <Clock size={26} color="#3B82F6" style={{ margin: '0 auto 8px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Avg Completion Time</span>
          <span style={{ fontSize: '26px', fontWeight: '800', color: '#93C5FD' }}>{summary.averageCompletionTime}s</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
          <Sparkles size={26} color="#F59E0B" style={{ margin: '0 auto 8px' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Next Activity Difficulty</span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#FCD34D' }}>{summary.latestAiRecommendedDifficulty}</span>
        </div>
      </div>

      {/* EMPTY STATE DISCLOSURE */}
      {isEmpty ? (
        <div
          className="glass-panel"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <Brain size={52} color="rgba(255,255,255,0.3)" />
          <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
            No Game Sessions Recorded Yet
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '460px', margin: 0 }}>
            No completed cognitive game sessions found for this user in MongoDB Atlas. Encourage them to play their first game from the Cognitive Games tab to generate real performance analytics!
          </p>
        </div>
      ) : (
        <>
          {/* 3. PERFORMANCE CHARTS */}
          <PerformanceCharts sessions={recentSessions} />

          {/* 4. GAME-WISE SUMMARY CARDS */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              🎮 Game-Wise Performance Breakdown
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Memory Match */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(236, 72, 153, 0.4)', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Brain size={22} color="#EC4899" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Memory Match</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Played: <strong style={{ color: '#FFFFFF' }}>{gamesByType.memory_match?.count || 0} sessions</strong></span>
                  <span>Avg Accuracy: <strong style={{ color: '#6EE7B7' }}>{gamesByType.memory_match?.avgAccuracy || 0}%</strong></span>
                  <span>Avg Score: <strong style={{ color: '#F472B6' }}>{gamesByType.memory_match?.avgScore || 0}</strong></span>
                </div>
              </div>

              {/* Pattern Recognition */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Target size={22} color="#F59E0B" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Pattern Recognition</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Played: <strong style={{ color: '#FFFFFF' }}>{gamesByType.pattern_recognition?.count || 0} sessions</strong></span>
                  <span>Avg Accuracy: <strong style={{ color: '#6EE7B7' }}>{gamesByType.pattern_recognition?.avgAccuracy || 0}%</strong></span>
                  <span>Avg Score: <strong style={{ color: '#F472B6' }}>{gamesByType.pattern_recognition?.avgScore || 0}</strong></span>
                </div>
              </div>

              {/* Daily Routine Recall */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99, 102, 241, 0.4)', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Calendar size={22} color="#6366F1" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Routine Recall</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Played: <strong style={{ color: '#FFFFFF' }}>{gamesByType.daily_routine_recall?.count || 0} sessions</strong></span>
                  <span>Avg Accuracy: <strong style={{ color: '#6EE7B7' }}>{gamesByType.daily_routine_recall?.avgAccuracy || 0}%</strong></span>
                  <span>Avg Score: <strong style={{ color: '#F472B6' }}>{gamesByType.daily_routine_recall?.avgScore || 0}</strong></span>
                </div>
              </div>

              {/* Object Recognition */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(20, 184, 166, 0.4)', borderRadius: '18px', padding: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Search size={22} color="#14B8A6" />
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF' }}>Object Recognition</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <span>Played: <strong style={{ color: '#FFFFFF' }}>{gamesByType.object_recognition?.count || 0} sessions</strong></span>
                  <span>Avg Accuracy: <strong style={{ color: '#6EE7B7' }}>{gamesByType.object_recognition?.avgAccuracy || 0}%</strong></span>
                  <span>Avg Score: <strong style={{ color: '#F472B6' }}>{gamesByType.object_recognition?.avgScore || 0}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. RECENT GAME HISTORY TABLE / LIST */}
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              📜 Recent Game History
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentSessions.map((sess: any, idx: number) => (
                <div
                  key={sess.id || idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid var(--border-glass-bright)',
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '17px', fontWeight: '800', color: '#FFFFFF', display: 'block' }}>
                      {getGameTitle(sess.gameType)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDateLabel(sess.completedAt)}
                      </span>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {formatDifficultyLabel(sess.difficulty)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Score</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#F472B6' }}>{sess.score}</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Accuracy</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#6EE7B7' }}>{sess.accuracy}%</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Time</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#93C5FD' }}>{sess.completionTime}s</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Completion</span>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#A5B4FC' }}>{sess.completionRate || 100}%</span>
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

