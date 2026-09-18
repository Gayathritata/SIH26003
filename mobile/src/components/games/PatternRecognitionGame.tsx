import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, RotateCcw } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface PatternItem {
  name: string;
  emoji: string;
}

const PATTERNS_POOL = [
  {
    sequence: [
      { name: 'Tea Leaf', emoji: '🍃' },
      { name: 'Bamboo', emoji: '🎋' },
      { name: 'Tea Leaf', emoji: '🍃' },
      { name: 'Bamboo', emoji: '🎋' },
    ],
    correctAnswer: { name: 'Tea Leaf', emoji: '🍃' },
    options: [
      { name: 'Tea Leaf', emoji: '🍃' },
      { name: 'Fish', emoji: '🐟' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Jhapi', emoji: '🧺' },
    ],
  },
  {
    sequence: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
    ],
    correctAnswer: { name: 'Apple', emoji: '🍎' },
    options: [
      { name: 'Apple', emoji: '🍎' },
      { name: 'Banana', emoji: '🍌' },
      { name: 'Orange', emoji: '🍊' },
      { name: 'Flower', emoji: '🌸' },
    ],
  },
  {
    sequence: [
      { name: 'Rhino', emoji: '🦏' },
      { name: 'Rhino', emoji: '🦏' },
      { name: 'Eri Silk', emoji: '🧶' },
      { name: 'Rhino', emoji: '🦏' },
      { name: 'Rhino', emoji: '🦏' },
    ],
    correctAnswer: { name: 'Eri Silk', emoji: '🧶' },
    options: [
      { name: 'Eri Silk', emoji: '🧶' },
      { name: 'Rhino', emoji: '🦏' },
      { name: 'Tea Leaf', emoji: '🍃' },
      { name: 'Bamboo', emoji: '🎋' },
    ],
  },
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

export const PatternRecognitionGame: React.FC<Props> = ({ difficulty, onFinish, lang }) => {
  const [patternIndex, setPatternIndex] = useState(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentPattern = PATTERNS_POOL[patternIndex % PATTERNS_POOL.length];

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedOption(null);
    voiceService.speak("Observe the pattern sequence and select what comes next.", lang);
  }, [patternIndex]);

  const handleSelectOption = (option: PatternItem) => {
    setSelectedOption(option.name);
    const duration = (Date.now() - startTime) / 1000;
    const isCorrect = option.name === currentPattern.correctAnswer.name;

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      voiceService.speak("Try again.", lang);
    } else {
      voiceService.speak("Correct!", lang);
      const acc = mistakes === 0 ? 1.0 : 0.75;
      const score = Math.round(acc * 100);

      setTimeout(() => {
        onFinish({
          gameType: 'pattern',
          difficulty,
          score,
          accuracy: acc,
          reactionTime: Math.round(duration * 10) / 10,
          mistakes,
        });
      }, 700);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Target size={28} color="#F59E0B" />
          <h2 className="title-lg">Pattern Recognition</h2>
        </div>
        <span className="badge badge-online">Level {difficulty}</span>
      </div>

      {/* Pattern Sequence */}
      <div className="card-glass" style={{ textAlign: 'center', padding: '24px' }}>
        <p className="text-elderly" style={{ color: '#94A3B8', marginBottom: '16px' }}>
          What comes next in the sequence?
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentPattern.sequence.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
              }}
            >
              {item.emoji}
            </div>
          ))}

          {/* Missing Item Question Mark */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: '#FFFFFF',
              boxShadow: '0 0 16px rgba(245, 158, 11, 0.4)',
            }}
          >
            ?
          </div>
        </div>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
        {currentPattern.options.map((option) => {
          const isSelected = selectedOption === option.name;
          const isCorrect = option.name === currentPattern.correctAnswer.name;

          return (
            <button
              key={option.name}
              onClick={() => handleSelectOption(option)}
              className="btn-elderly"
              style={{
                height: '90px',
                background: isSelected
                  ? (isCorrect ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F43F5E, #E11D48)')
                  : 'rgba(30, 41, 59, 0.8)',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.12)',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '32px' }}>{option.emoji}</span>
              <span style={{ fontSize: '17px', color: '#FFFFFF' }}>{option.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
