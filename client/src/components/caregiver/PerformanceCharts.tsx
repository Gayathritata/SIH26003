import React from 'react';

export interface ChartSessionItem {
  id?: string;
  gameType?: string;
  accuracy: number;
  score: number;
  completionTime: number;
  completedAt?: string;
}

interface PerformanceChartsProps {
  sessions: ChartSessionItem[];
}

export const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ sessions }) => {
  if (!sessions || sessions.length === 0) {
    return (
      <div
        style={{
          padding: '36px',
          textAlign: 'center',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px dashed var(--border-glass)',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}
      >
        No game session performance history available to render charts.
      </div>
    );
  }

  // Reverse so older sessions are on left, newest on right
  const sorted = [...sessions].reverse();
  const maxScore = Math.max(100, ...sorted.map((s) => s.score || 0));
  const maxTime = Math.max(60, ...sorted.map((s) => s.completionTime || 0));

  // Chart width & height
  const width = 600;
  const height = 180;
  const padding = 35;

  const pointsAcc = sorted.map((s, idx) => {
    const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
    const y = height - padding - (Math.min(100, s.accuracy) / 100) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const pointsScore = sorted.map((s, idx) => {
    const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
    const y = height - padding - ((s.score || 0) / maxScore) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const pointsTime = sorted.map((s, idx) => {
    const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
    const y = height - padding - (Math.min(maxTime, s.completionTime || 0) / maxTime) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Accuracy Over Time Line Chart */}
      <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              📈 Accuracy Over Time (%)
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Tracks session accuracy percentage across completed cognitive games.
            </p>
          </div>
          <span className="badge-pill badge-emerald" style={{ fontSize: '12px' }}>
            Latest: {sorted[sorted.length - 1]?.accuracy}%
          </span>
        </div>

        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '300px' }}>
            {/* Gridlines */}
            {[0, 25, 50, 75, 100].map((val) => {
              const y = height - padding - (val / 100) * (height - padding * 2);
              return (
                <g key={val}>
                  <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#E2E8F0" strokeDasharray="3,3" />
                  <text x={padding - 6} y={y + 4} fill="#64748B" fontSize="10" textAnchor="end">{val}%</text>
                </g>
              );
            })}

            {/* Line Trend */}
            <polyline fill="none" stroke="#10B981" strokeWidth="3" points={pointsAcc} strokeLinecap="round" strokeLinejoin="round" />

            {/* Data Points */}
            {sorted.map((s, idx) => {
              const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
              const y = height - padding - (Math.min(100, s.accuracy) / 100) * (height - padding * 2);
              return (
                <circle key={idx} cx={x} cy={y} r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
              );
            })}
          </svg>
        </div>
      </div>

      {/* 2. Score & Completion Time Dual Trends */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Score Trend */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              🎯 Score Trend
            </h4>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-primary)' }}>
              Avg: {Math.round(sorted.reduce((a, b) => a + (b.score || 0), 0) / sorted.length)}
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '280px' }}>
              <polyline fill="none" stroke="#0284C7" strokeWidth="3" points={pointsScore} strokeLinecap="round" strokeLinejoin="round" />
              {sorted.map((s, idx) => {
                const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
                const y = height - padding - ((s.score || 0) / maxScore) * (height - padding * 2);
                return <circle key={idx} cx={x} cy={y} r="4" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />;
              })}
            </svg>
          </div>
        </div>

        {/* Completion Time Trend */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              ⏱️ Completion Time Trend (s)
            </h4>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-indigo)' }}>
              Avg: {Math.round(sorted.reduce((a, b) => a + (b.completionTime || 0), 0) / sorted.length)}s
            </span>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '280px' }}>
              <polyline fill="none" stroke="#4F46E5" strokeWidth="3" points={pointsTime} strokeLinecap="round" strokeLinejoin="round" />
              {sorted.map((s, idx) => {
                const x = padding + (idx / Math.max(1, sorted.length - 1)) * (width - padding * 2);
                const y = height - padding - (Math.min(maxTime, s.completionTime || 0) / maxTime) * (height - padding * 2);
                return <circle key={idx} cx={x} cy={y} r="4" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />;
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
