import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, Target, Calendar, RotateCcw, Brain, Search, Sparkles } from 'lucide-react';
import { fetchMyGameSessions } from '../services/api';
import { Language, getTranslation } from '../utils/i18n';

interface ProgressPageProps {
  lang: Language;
  onNavigate: (path: string) => void;
}

export interface GameSessionRecord {
  _id?: string;
  id?: string;
  gameType: string;
  difficulty: number;
  totalPairs?: number;
  attempts?: number;
  correctMatches?: number;
  incorrectAttempts?: number;
  accuracy: number;
  completionTime: number;
  score: number;
  completedAt?: string;
  createdAt?: string;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ lang, onNavigate }) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(lang, key);

  const [sessions, setSessions] = useState<GameSessionRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const loadSessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyGameSessions();
      if (res && res.success && Array.isArray(res.sessions)) {
        setSessions(res.sessions);
      } else if (Array.isArray(res)) {
        setSessions(res);
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.warn('[FETCH SESSIONS FAILED]', err);
      setError('Could not load game history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const getGameTitleText = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return 'Memory Match';
    if (type === 'pattern_recognition' || type === 'pattern') return 'Pattern Recognition';
    if (type === 'daily_routine_recall' || type === 'routine') return 'Daily Routine Recall';
    if (type === 'object_recognition' || type === 'object_rec') return 'Object Recognition';
    return 'Cognitive Activity';
  };

  const renderGameIcon = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return <Brain size={22} color="#0284C7" />;
    if (type === 'pattern_recognition' || type === 'pattern') return <Target size={22} color="#D97706" />;
    if (type === 'daily_routine_recall' || type === 'routine') return <Calendar size={22} color="#4F46E5" />;
    if (type === 'object_recognition' || type === 'object_rec') return <Search size={22} color="#0D9488" />;
    return <Brain size={22} color="#0284C7" />;
  };

  const getGameIconBg = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return '#E0F2FE';
    if (type === 'pattern_recognition' || type === 'pattern') return '#FEF3C7';
    if (type === 'daily_routine_recall' || type === 'routine') return '#E0E7FF';
    if (type === 'object_recognition' || type === 'object_rec') return '#CCFBF1';
    return '#F1F5F9';
  };

  const formatDifficultyLabel = (diff: number) => {
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

  // Deduplicate entries submitted twice by previous bug
  const deduplicatedSessions = sessions.filter((sess, idx, arr) => {
    if (idx === 0) return true;
    const prev = arr[idx - 1];
    const isDuplicate =
      prev.gameType === sess.gameType &&
      prev.score === sess.score &&
      prev.accuracy === sess.accuracy &&
      prev.completionTime === sess.completionTime &&
      Math.abs(
        new Date(prev.completedAt || prev.createdAt || 0).getTime() -
        new Date(sess.completedAt || sess.createdAt || 0).getTime()
      ) < 5000;
    return !isDuplicate;
  });

  const filteredSessions = deduplicatedSessions.filter((s) => {
    if (selectedFilter === 'all') return true;
    const type = (s.gameType || '').toLowerCase();
    if (selectedFilter === 'memory') return type === 'memory_match' || type === 'memory';
    if (selectedFilter === 'pattern') return type === 'pattern_recognition' || type === 'pattern';
    if (selectedFilter === 'routine') return type === 'daily_routine_recall' || type === 'routine';
    if (selectedFilter === 'object') return type === 'object_recognition' || type === 'object_rec';
    return true;
  });

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 16px', fontSize: '15px' }}
        >
          <ArrowLeft size={18} /> {t('backToHome')}
        </button>
        <h2 className="text-section-title">📊 Cognitive Progress</h2>
        <button
          onClick={loadSessions}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 14px', fontSize: '14px' }}
          title="Refresh History"
        >
          <RotateCcw size={16} /> Refresh
        </button>
      </div>

      {/* Main Container */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284C7, #0D9488)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
              }}
            >
              <Trophy size={24} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                Completed Game Sessions
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Track your cognitive scores and progress trends.
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '4px', borderRadius: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Games' },
              { id: 'memory', label: 'Memory' },
              { id: 'pattern', label: 'Pattern' },
              { id: 'routine', label: 'Routine' },
              { id: 'object', label: 'Object' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedFilter(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: selectedFilter === tab.id ? 'var(--accent-primary)' : 'transparent',
                  color: selectedFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: selectedFilter === tab.id ? '700' : '600',
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

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px' }}>
            Loading completed game sessions...
          </div>
        ) : error ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#BE123C', fontSize: '14px' }}>
            {error}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              background: '#F8FAFC',
              borderRadius: '16px',
              border: '1px dashed var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Trophy size={40} color="var(--border-glass-bright)" />
            <h4 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              No completed games yet.
            </h4>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '380px', margin: 0 }}>
              Play cognitive games from the Games tab to track your history.
            </p>
            <button
              onClick={() => onNavigate('/games')}
              className="btn-primary btn-emerald"
              style={{ minHeight: '44px', padding: '0 20px', fontSize: '15px', marginTop: '6px' }}
            >
              Play Games Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredSessions.map((sess, idx) => (
              <div
                key={sess._id || sess.id || idx}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '16px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                  boxShadow: 'var(--shadow-soft)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Left side: Icon, Title, Date, Level */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '14px',
                      background: getGameIconBg(sess.gameType),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    {renderGameIcon(sess.gameType)}
                  </div>
                  <div>
                    <span style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', letterSpacing: '-0.2px' }}>
                      {getGameTitleText(sess.gameType)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>
                        {formatDateLabel(sess.completedAt || sess.createdAt)}
                      </span>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '12px', padding: '3px 10px', fontWeight: '700' }}>
                        {formatDifficultyLabel(sess.difficulty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Score, Accuracy, Time Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Score
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-primary)', marginTop: '2px', display: 'block' }}>
                      {sess.score}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Accuracy
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#15803D', marginTop: '2px', display: 'block' }}>
                      {sess.accuracy}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Time
                    </span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#4F46E5', marginTop: '2px', display: 'block' }}>
                      {sess.completionTime}s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

