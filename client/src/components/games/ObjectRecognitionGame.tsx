import React, { useState, useEffect } from 'react';
import { Search, Mic, Volume2, CheckCircle2 } from 'lucide-react';
import { voiceService } from '../../services/voiceService';

interface CulturalObject {
  title: string;
  question: string;
  options: string[];
  correctAnswer: string;
  imageEmoji: string;
  category: string;
}

const CULTURAL_OBJECTS: CulturalObject[] = [
  {
    title: 'Traditional Bamboo Headgear',
    question: 'Identify this traditional woven bamboo and palm leaf conical hat from Assam:',
    options: ['Jhapi', 'Gamucha', 'Pugree', 'Topi'],
    correctAnswer: 'Jhapi',
    imageEmoji: '🧺',
    category: 'Assam Traditional Object',
  },
  {
    title: 'Kaziranga Wildlife',
    question: 'Identify this famous one-horned animal native to Assam Kaziranga National Park:',
    options: ['One-Horned Rhinoceros', 'Asian Elephant', 'Bengal Tiger', 'Snow Leopard'],
    correctAnswer: 'One-Horned Rhinoceros',
    imageEmoji: '🦏',
    category: 'North-East Wildlife',
  },
  {
    title: 'Indigenous Assam Fabric',
    question: 'Identify this world-famous eco-friendly thermal silk variety woven in Assam:',
    options: ['Eri Silk', 'Polyester', 'Cotton', 'Nylon'],
    correctAnswer: 'Eri Silk',
    imageEmoji: '🧶',
    category: 'Regional Textile',
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

export const ObjectRecognitionGame: React.FC<Props> = ({ difficulty, onFinish, lang }) => {
  const [index, setIndex] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [mistakes, setMistakes] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentObj = CULTURAL_OBJECTS[index % CULTURAL_OBJECTS.length];

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedAnswer(null);
    voiceService.speak(`${currentObj.title}. ${currentObj.question}`, lang);
  }, [index]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const duration = (Date.now() - startTime) / 1000;
    const isCorrect = answer.toLowerCase().trim() === currentObj.correctAnswer.toLowerCase().trim();

    if (!isCorrect) {
      setMistakes((m) => m + 1);
      voiceService.speak("Try again.", lang);
    } else {
      voiceService.speak(`Excellent! That is indeed ${currentObj.correctAnswer}.`, lang);
      const acc = mistakes === 0 ? 1.0 : 0.75;
      const score = Math.round(acc * 100);

      setTimeout(() => {
        onFinish({
          gameType: 'object_rec',
          difficulty,
          score,
          accuracy: acc,
          reactionTime: Math.round(duration * 10) / 10,
          mistakes,
        });
      }, 900);
    }
  };

  const handleStartVoice = () => {
    setIsListening(true);
    voiceService.speak("Listening... Speak your answer now.", lang);
    voiceService.listen(
      (transcript) => {
        setIsListening(false);
        // Find matching option
        const match = currentObj.options.find((opt) => transcript.toLowerCase().includes(opt.toLowerCase()));
        if (match) {
          handleAnswer(match);
        } else {
          handleAnswer(transcript);
        }
      },
      (err) => setIsListening(false)
    );
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={28} color="#14B8A6" />
          <h2 className="title-lg">Object Recognition</h2>
        </div>
        <span className="badge badge-online">Level {difficulty}</span>
      </div>

      {/* Item Image Card */}
      <div className="card-glass" style={{ textAlign: 'center', padding: '24px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '28px',
            background: 'rgba(20, 184, 166, 0.15)',
            border: '2px solid #14B8A6',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '64px',
            boxShadow: '0 0 24px rgba(20, 184, 166, 0.3)',
          }}
        >
          {currentObj.imageEmoji}
        </div>

        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#14B8A6', marginBottom: '8px' }}>
          {currentObj.category}
        </span>
        <p className="text-elderly" style={{ color: '#FFFFFF', fontWeight: '700', marginTop: '6px' }}>
          {currentObj.question}
        </p>
      </div>

      {/* Voice Answer Option */}
      <button
        className={`btn-elderly ${isListening ? 'pulse-anim' : ''}`}
        onClick={handleStartVoice}
        style={{
          background: isListening ? 'linear-gradient(135deg, #F43F5E, #E11D48)' : 'linear-gradient(135deg, #14B8A6, #0D9488)',
          color: '#FFFFFF',
        }}
      >
        <Mic size={24} /> {isListening ? 'Listening...' : 'Answer by Voice 🎙️'}
      </button>

      {/* Tap Answer Options */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {currentObj.options.map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isCorrect = opt === currentObj.correctAnswer;

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="btn-elderly"
              style={{
                height: '75px',
                fontSize: '17px',
                background: isSelected
                  ? (isCorrect ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #F43F5E, #E11D48)')
                  : 'rgba(30, 41, 59, 0.8)',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};
