import React from 'react';
import { ArrowLeft, Clock, Target, CheckCircle2, Award } from 'lucide-react';
import { Language } from '../../../utils/i18n';

interface GameHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  difficulty: number;
  elapsedSeconds: number;
  correctCount?: number;
  totalCount?: number;
  attemptsCount?: number;
  onNavigateBack?: () => void;
  onChangeDifficulty?: (diff: number) => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  title,
  subtitle,
  icon,
  difficulty,
  elapsedSeconds,
  correctCount,
  totalCount,
  attemptsCount,
  onNavigateBack,
  onChangeDifficulty,
}) => {
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDiffLabel = (diff: number) => {
    if (diff === 1) return 'Easy';
    if (diff === 2) return 'Medium';
    return 'Hard';
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onNavigateBack && (
            <button
              type="button"
              onClick={onNavigateBack}
              className="btn-primary btn-glass-subtle"
              style={{ minHeight: '44px', padding: '0 16px', fontSize: '15px' }}
              aria-label="Back to Games"
            >
              <ArrowLeft size={20} /> Back
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {icon}
            <div>
              <h2 className="text-hero-title" style={{ fontSize: '26px', margin: 0 }}>
                {title}
              </h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '4px 0 0 0', fontWeight: '600' }}>
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Level Buttons */}
        {onChangeDifficulty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', padding: '6px', borderRadius: '16px' }}>
            {[1, 2, 3].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChangeDifficulty(level)}
                className={`btn-primary ${difficulty === level ? 'btn-emerald' : 'btn-glass-subtle'}`}
                style={{ minHeight: '40px', padding: '0 14px', fontSize: '14px', borderRadius: '12px' }}
              >
                {getDiffLabel(level)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Game Scoreboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '14px 18px',
          borderRadius: '16px',
          border: '1px solid var(--border-glass)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={20} color="#EC4899" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Difficulty</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#FFFFFF' }}>
              {getDiffLabel(difficulty)}
            </span>
          </div>
        </div>

        {correctCount !== undefined && totalCount !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={20} color="#10B981" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Score/Progress</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#6EE7B7' }}>
                {correctCount} / {totalCount}
              </span>
            </div>
          </div>
        )}

        {attemptsCount !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="#F59E0B" />
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Attempts</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#FCD34D' }}>
                {attemptsCount}
              </span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#3B82F6" />
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', fontWeight: '600' }}>Timer</span>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#93C5FD' }}>
              {formatTimer(elapsedSeconds)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
