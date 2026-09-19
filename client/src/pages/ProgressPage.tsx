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
    if (type === 'memory_match' || type === 'memory') return '#EC4899';
    if (type === 'pattern_recognition' || type === 'pattern') return '#F59E0B';
    if (type === 'daily_routine_recall' || type === 'routine') return '#6366F1';
    if (type === 'object_recognition' || type === 'object_rec') return '#14B8A6';
    return '#8B5CF6';
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
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => onNavigate('/dashboard')}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '48px', padding: '0 18px', fontSize: '16px' }}
        >
          <ArrowLeft size={20} /> {t('backToHome')}
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

      {/* Main History Container */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #EC4899, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(236, 72, 153, 0.4)',
              }}
            >
              <Trophy size={28} color="#FFFFFF" />
            </div>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
                Completed Game Sessions
              </h3>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '500' }}>
                Track your memory, pattern, routine, and object recognition scores.
              </p>
            </div>
          </div>

          {/* Game Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '6px', borderRadius: '16px', flexWrap: 'wrap' }}>
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
                className={`btn-primary ${selectedFilter === tab.id ? 'btn-emerald' : 'btn-glass-subtle'}`}
                style={{ minHeight: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '10px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '16px' }}>
            Loading completed game sessions...
          </div>
        ) : error ? (
          <div style={{ padding: '30px', textAlign: 'center', color: '#EF4444', fontSize: '15px' }}>
            {error}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.25)',
              borderRadius: '20px',
              border: '1px dashed var(--border-glass)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Trophy size={48} color="rgba(255, 255, 255, 0.3)" />
            <h4 style={{ fontSize: '22px', fontWeight: '700', color: '#FFFFFF', margin: 0 }}>
              No completed games yet.
            </h4>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '400px', margin: 0 }}>
              Play cognitive games from the Games tab to track your performance and history.
            </p>
            <button
              onClick={() => onNavigate('/games')}
              className="btn-primary btn-emerald"
              style={{ minHeight: '48px', padding: '0 24px', fontSize: '16px', marginTop: '8px' }}
            >
              Play Games Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredSessions.map((sess, idx) => (
              <div
                key={sess._id || sess.id || idx}
                style={{
                  background: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid var(--border-glass-bright)',
                  borderRadius: '18px',
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                {/* Game Name & Date / Difficulty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: `2px solid ${getGameBadgeColor(sess.gameType)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={22} color={getGameBadgeColor(sess.gameType)} />
                  </div>
                  <div>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#FFFFFF', display: 'block' }}>
                      {getGameTitle(sess.gameType)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {formatDateLabel(sess.completedAt || sess.createdAt)}
                      </span>
                      <span className="badge-pill badge-emerald" style={{ fontSize: '11px', padding: '2px 8px' }}>
                        {formatDifficultyLabel(sess.difficulty)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics: Score, Accuracy, Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Score</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#F472B6' }}>
                      {sess.score}
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Accuracy</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#6EE7B7' }}>
                      {sess.accuracy}%
                    </span>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Time</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#93C5FD' }}>
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

