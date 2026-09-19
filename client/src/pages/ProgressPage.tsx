import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, Target, Calendar, Award, RotateCcw, Brain } from 'lucide-react';
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

  const getGameTitle = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return '🧠 Memory Match';
    if (type === 'pattern_recognition' || type === 'pattern') return '🔷 Pattern Recognition';
    if (type === 'daily_routine_recall' || type === 'routine') return '📅 Daily Routine Recall';
    if (type === 'object_recognition' || type === 'object_rec') return '👀 Object Recognition';
    return 'Cognitive Game';
  };

  const getGameBadgeColor = (gameType: string) => {
    const type = (gameType || '').toLowerCase();
    if (type === 'memory_match' || type === 'memory') return '#0284C7';
    if (type === 'pattern_recognition' || type === 'pattern') return '#D97706';
    if (type === 'daily_routine_recall' || type === 'routine') return '#4F46E5';
    if (type === 'object_recognition' || type === 'object_rec') return '#0D9488';
    return '#64748B';
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

  const filteredSessions = sessions.filter((s) => {
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredSessions.map((sess, idx) => (
              <div
                key={sess._id || sess.id || idx}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: '#FFFFFF',
                      border: `2px solid ${getGameBadgeColor(sess.gameType)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={20} color={getGameBadgeColor(sess.gameType)} />
                  </div>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                      {getGameTitle(sess.gameType)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDateLabel(sess.completedAt || sess.createdAt)}
                      </span>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {formatDifficultyLabel(sess.difficulty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Score</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-primary)' }}>
                      {sess.score}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Accuracy</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#15803D' }}>
                      {sess.accuracy}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Time</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-indigo)' }}>
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
