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

  const formatDifficultyLabel = (diff: number) => {
    if (diff === 1) return 'Easy (3 Pairs)';
    if (diff === 2) return 'Medium (4 Pairs)';
    if (diff === 3) return 'Hard (6 Pairs)';
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
        <h2 className="text-section-title">📊 Game Progress</h2>
        <button
          onClick={loadSessions}
          className="btn-primary btn-glass-subtle"
          style={{ minHeight: '42px', padding: '0 14px', fontSize: '14px' }}
          title="Refresh History"
        >
          <RotateCcw size={16} /> Refresh
        </button>
      </div>

      {/* Memory Match History Card Container */}
      <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <Brain size={28} color="#FFFFFF" />
          </div>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: 0 }}>
              🧠 Memory Match History
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '500' }}>
              Track your cognitive performance across completed game sessions.
            </p>
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
        ) : sessions.length === 0 ? (
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
              Play your first Memory Match game from the Cognitive Games tab to track your scores and memory accuracy.
            </p>
            <button
              onClick={() => onNavigate('/games')}
              className="btn-primary btn-emerald"
              style={{ minHeight: '48px', padding: '0 24px', fontSize: '16px', marginTop: '8px' }}
            >
              Play Memory Match Now
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {sessions.map((sess, idx) => (
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
                {/* Date & Game Type / Difficulty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      background: 'rgba(236, 72, 153, 0.15)',
                      border: '1px solid rgba(236, 72, 153, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Calendar size={22} color="#F472B6" />
                  </div>
                  <div>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#FFFFFF', display: 'block' }}>
                      {formatDateLabel(sess.completedAt || sess.createdAt)}
                    </span>
                    <span className="badge-pill badge-emerald" style={{ fontSize: '12px', marginTop: '4px', display: 'inline-block' }}>
                      Difficulty: {formatDifficultyLabel(sess.difficulty)}
                    </span>
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

