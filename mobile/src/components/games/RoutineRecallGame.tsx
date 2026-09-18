import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Volume2 } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface RoutineStep {
  name: string;
  emoji: string;
  time: string;
}

const MORNING_ROUTINE: RoutineStep[] = [
  { name: 'Wake Up', emoji: '🌅', time: '07:00 AM' },
  { name: 'Brush Teeth', emoji: '🪥', time: '07:30 AM' },
  { name: 'Breakfast', emoji: '🥣', time: '08:00 AM' },
  { name: 'Morning Medicine', emoji: '💊', time: '08:30 AM' },
  { name: 'Morning Walk', emoji: '🚶', time: '09:00 AM' },
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

export const RoutineRecallGame: React.FC<Props> = ({ difficulty, onFinish, lang }) => {
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [mistakes, setMistakes] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Question: What comes right after Breakfast? Correct answer: Morning Medicine 💊
  const questionText = "What activity should you complete right after Breakfast?";
  const correctAnswer = "Morning Medicine";

  const options = [
    { name: 'Morning Medicine', emoji: '💊' },
    { name: 'Morning Walk', emoji: '🚶' },
    { name: 'Go to Sleep', emoji: '😴' },
    { name: 'Dinner', emoji: '🍲' },
  ];

  useEffect(() => {
    setStartTime(Date.now());
    voiceService.speak(`Daily Routine Recall. ${questionText}`, lang);
  }, []);

  const handleOptionClick = (optName: string) => {
    setSelectedOption(optName);
    const duration = (Date.now() - startTime) / 1000;
    const isCorrect = optName === correctAnswer;

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      voiceService.speak("Incorrect step. Try again.", lang);
    } else {
      voiceService.speak("Well done! Morning Medicine comes after Breakfast.", lang);
      const acc = mistakes === 0 ? 1.0 : 0.8;
      const score = Math.round(acc * 100);

      setTimeout(() => {
        onFinish({
          gameType: 'routine',
          difficulty,
          score,
          accuracy: acc,
          reactionTime: Math.round(duration * 10) / 10,
          mistakes,
        });
      }, 800);
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={28} color="#6366F1" />
          <h2 className="title-lg">Daily Routine Recall</h2>
        </div>
        <span className="badge badge-online">Level {difficulty}</span>
      </div>

      {/* Routine Timeline Visualizer */}
      <div className="card-glass" style={{ padding: '16px' }}>
        <p style={{ fontSize: '15px', color: '#94A3B8', marginBottom: '12px', textAlign: 'center' }}>
          Standard Daily Routine Timeline:
        </p>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
          {MORNING_ROUTINE.map((step, idx) => (
            <div
              key={idx}
              style={{
                minWidth: '75px',
                padding: '10px 6px',
                borderRadius: '14px',
                background: step.name === 'Breakfast' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.06)',
                border: step.name === 'Breakfast' ? '2px solid #6366F1' : '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '26px' }}>{step.emoji}</span>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#FFFFFF', marginTop: '4px' }}>{step.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="card-glass" style={{ textAlign: 'center', padding: '20px', borderLeft: '4px solid #6366F1' }}>
        <p className="text-elderly" style={{ color: '#FFFFFF', fontWeight: '700' }}>
          {questionText}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {options.map((opt) => {
          const isSelected = selectedOption === opt.name;
          const isCorrect = opt.name === correctAnswer;

          return (
            <button
              key={opt.name}
              onClick={() => handleOptionClick(opt.name)}
              className="btn-elderly"
              style={{
                background: isSelected
                  ? (isCorrect ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F43F5E, #E11D48)')
                  : 'rgba(30, 41, 59, 0.8)',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.12)',
                justifyContent: 'flex-start',
                padding: '0 20px',
              }}
            >
              <span style={{ fontSize: '32px' }}>{opt.emoji}</span>
              <span style={{ fontSize: '19px', color: '#FFFFFF' }}>{opt.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
