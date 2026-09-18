import React, { useState, useEffect } from 'react';
import { Brain, RotateCcw, ArrowLeft } from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { getTranslation } from '../../i18n/translations';

interface MemoryItem {
  id: string;
  name: string;
  emoji: string;
}

const ITEMS_POOL: MemoryItem[] = [
  { id: 'apple', name: 'Apple 🍎', emoji: '🍎' },
  { id: 'flower', name: 'Flower 🌸', emoji: '🌸' },
  { id: 'fish', name: 'Fish 🐟', emoji: '🐟' },
  { id: 'house', name: 'House 🏠', emoji: '🏠' },
  { id: 'jhapi', name: 'Basket 🧺', emoji: '🧺' },
  { id: 'rhino', name: 'Rhino 🦏', emoji: '🦏' },
  { id: 'tea', name: 'Tea Leaf 🍃', emoji: '🍃' },
  { id: 'bamboo', name: 'Bamboo 🎋', emoji: '🎋' },
];

interface Props {
  difficulty: number;
  onFinish: (result: {
    gameType: string;
    difficulty: number;
    score: number;
    accuracy: number;
    reactionTime: number;
    mistakes: number;
  }) => void;
  lang: string;
}

export const MemoryMatchGame: React.FC<Props> = ({ difficulty, onFinish, lang }) => {
  const [phase, setPhase] = useState<'memorize' | 'test'>('memorize');
  const [targetItems, setTargetItems] = useState<MemoryItem[]>([]);
  const [options, setOptions] = useState<MemoryItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [timer, setTimer] = useState<number>(5);
  const [startTime, setStartTime] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);

  const itemLimit = Math.min(8, 2 + difficulty);

  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  const startNewGame = () => {
    const shuffled = [...ITEMS_POOL].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, itemLimit);
    setTargetItems(chosen);

    const distractors = ITEMS_POOL.filter((item) => !chosen.some((c) => c.id === item.id)).sort(() => Math.random() - 0.5);
    const combinedOptions = [...chosen, ...distractors.slice(0, Math.max(2, 8 - chosen.length))].sort(() => Math.random() - 0.5);
    setOptions(combinedOptions);

    setSelectedIds([]);
    setMistakes(0);
    setPhase('memorize');
    setTimer(6);

    voiceService.speak("Memorize these objects. They will hide shortly.", lang);
  };

  useEffect(() => {
    let interval: any;
    if (phase === 'memorize') {
      if (timer > 0) {
        interval = setInterval(() => setTimer((t) => t - 1), 1000);
      } else {
        setPhase('test');
        setStartTime(Date.now());
        voiceService.speak("Select all the objects you just saw.", lang);
      }
    }
    return () => clearInterval(interval);
  }, [phase, timer]);

  const handleToggleSelect = (item: MemoryItem) => {
    if (phase !== 'test') return;

    const isAlreadySelected = selectedIds.includes(item.id);
    let nextSelected: string[];

    if (isAlreadySelected) {
      nextSelected = selectedIds.filter((id) => id !== item.id);
    } else {
      nextSelected = [...selectedIds, item.id];
      const isTarget = targetItems.some((t) => t.id === item.id);
      if (!isTarget) {
        setMistakes((m) => m + 1);
      }
    }

    setSelectedIds(nextSelected);

    const correctCount = nextSelected.filter((id) => targetItems.some((t) => t.id === id)).length;
    if (correctCount === targetItems.length && nextSelected.length === targetItems.length) {
      const endTime = Date.now();
      const durationSeconds = Math.max(1.5, (endTime - startTime) / 1000);
      const calcAccuracy = Math.max(0.2, (targetItems.length - mistakes) / targetItems.length);
      const score = Math.round(calcAccuracy * 100);

      onFinish({
        gameType: 'memory',
        difficulty,
        score,
        accuracy: Math.round(calcAccuracy * 100) / 100,
        reactionTime: Math.round(durationSeconds * 10) / 10,
        mistakes,
      });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Game Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={24} color="#10B981" />
          </div>
          <div>
            <h2 className="text-section-title">{getTranslation(lang as any, 'memoryGameTitle')}</h2>
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>{getTranslation(lang as any, 'memoryGameDesc')}</p>
          </div>
        </div>

        <span className="badge-pill badge-emerald">Difficulty Level {difficulty}</span>
      </div>

      {/* Stage Instruction Banner */}
      <div style={{ background: phase === 'memorize' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)', border: phase === 'memorize' ? '1px solid #F59E0B' : '1px solid #10B981', borderRadius: '16px', padding: '16px 20px', textAlign: 'center' }}>
        {phase === 'memorize' ? (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#FCD34D' }}>
              Memorize these {targetItems.length} objects! Hiding in {timer}s...
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '20px', fontWeight: '800', color: '#6EE7B7' }}>
              Tap the {targetItems.length} objects you saw earlier:
            </p>
            <span style={{ fontSize: '14px', color: '#94A3B8' }}>
              Selected: {selectedIds.length} of {targetItems.length}
            </span>
          </div>
        )}
      </div>

      {/* Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        {(phase === 'memorize' ? targetItems : options).map((item) => {
          const isSelected = selectedIds.includes(item.id);
          const isTarget = targetItems.some((t) => t.id === item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleToggleSelect(item)}
              disabled={phase === 'memorize'}
              style={{
                minHeight: '120px',
                borderRadius: '20px',
                background: phase === 'memorize'
                  ? 'rgba(16, 185, 129, 0.12)'
                  : (isSelected
                    ? (isTarget ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F43F5E, #E11D48)')
                    : 'rgba(255, 255, 255, 0.05)'),
                border: phase === 'memorize'
                  ? '2px solid #10B981'
                  : (isSelected ? '2px solid #FFFFFF' : '1px solid var(--border-glass)'),
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: phase === 'memorize' ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '44px' }}>{item.emoji}</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#FFFFFF' }}>{item.name}</span>
            </button>
          );
        })}
      </div>

      <button className="btn-primary btn-glass-subtle" onClick={startNewGame} style={{ minHeight: '48px', fontSize: '16px' }}>
        <RotateCcw size={18} /> Reset Activity
      </button>
    </div>
  );
};
