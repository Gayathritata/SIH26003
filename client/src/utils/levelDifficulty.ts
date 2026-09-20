/**
 * Centralized Level Difficulty & Question Generator for MINDMATE NER
 * Scales difficulty dynamically across Levels 1 to 100 for all cognitive games.
 */

// ==================== 1. MEMORY MATCH CONFIGURATION ====================
export interface MemoryMatchConfig {
  level: number;
  totalPairs: number;
  totalCards: number;
  gridCols: number;
  previewSeconds: number;
}

export const getMemoryMatchConfig = (level: number): MemoryMatchConfig => {
  const lvl = Math.max(1, Math.min(100, level));

  let totalPairs = 3;
  let gridCols = 3;

  if (lvl === 1) {
    totalPairs = 3; // 6 cards (3x2 grid)
    gridCols = 3;
  } else if (lvl === 2) {
    totalPairs = 4; // 8 cards (4x2 grid) — DISTINCT FROM LEVEL 1!
    gridCols = 4;
  } else if (lvl === 3) {
    totalPairs = 5; // 10 cards (5x2 grid)
    gridCols = 5;
  } else if (lvl === 4) {
    totalPairs = 6; // 12 cards (4x3 grid)
    gridCols = 4;
  } else if (lvl === 5) {
    totalPairs = 7; // 14 cards
    gridCols = 4;
  } else if (lvl <= 10) {
    totalPairs = 8; // 16 cards (4x4 grid)
    gridCols = 4;
  } else if (lvl <= 25) {
    totalPairs = 9; // 18 cards
    gridCols = 6;
  } else if (lvl <= 50) {
    totalPairs = 10; // 20 cards
    gridCols = 5;
  } else {
    totalPairs = 12; // 24 cards
    gridCols = 6;
  }

  const previewSeconds = Math.max(1, 4 - Math.floor(lvl / 25));

  return {
    level: lvl,
    totalPairs,
    totalCards: totalPairs * 2,
    gridCols,
    previewSeconds,
  };
};

// ==================== 2. PATTERN RECOGNITION GENERATOR ====================
export interface PatternItem {
  name: string;
  emoji: string;
}

export interface PatternQuestion {
  sequence: PatternItem[];
  correctAnswer: PatternItem;
  options: PatternItem[];
}

const PATTERN_EMOJIS: PatternItem[] = [
  { name: 'Apple', emoji: '🍎' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Mango', emoji: '🥭' },
  { name: 'Flower', emoji: '🌸' },
  { name: 'Leaf', emoji: '🍃' },
  { name: 'Cup', emoji: '☕' },
  { name: 'Book', emoji: '📖' },
  { name: 'Clock', emoji: '⏰' },
  { name: 'Chair', emoji: '🪑' },
  { name: 'Star', emoji: '⭐' },
  { name: 'Heart', emoji: '❤️' },
  { name: 'Sun', emoji: '☀️' },
];

export const getPatternQuestionsForLevel = (level: number): PatternQuestion[] => {
  const lvl = Math.max(1, Math.min(100, level));

  if (lvl === 1) {
    return [
      {
        sequence: [PATTERN_EMOJIS[0], PATTERN_EMOJIS[1], PATTERN_EMOJIS[0]],
        correctAnswer: PATTERN_EMOJIS[1],
        options: [PATTERN_EMOJIS[1], PATTERN_EMOJIS[0], PATTERN_EMOJIS[2]],
      },
      {
        sequence: [PATTERN_EMOJIS[5], PATTERN_EMOJIS[6], PATTERN_EMOJIS[5]],
        correctAnswer: PATTERN_EMOJIS[6],
        options: [PATTERN_EMOJIS[3], PATTERN_EMOJIS[6], PATTERN_EMOJIS[5]],
      },
      {
        sequence: [PATTERN_EMOJIS[7], PATTERN_EMOJIS[8], PATTERN_EMOJIS[7]],
        correctAnswer: PATTERN_EMOJIS[8],
        options: [PATTERN_EMOJIS[8], PATTERN_EMOJIS[4], PATTERN_EMOJIS[7]],
      },
    ];
  }

  if (lvl === 2) {
    return [
      {
        sequence: [PATTERN_EMOJIS[3], PATTERN_EMOJIS[4], PATTERN_EMOJIS[3], PATTERN_EMOJIS[4], PATTERN_EMOJIS[3]],
        correctAnswer: PATTERN_EMOJIS[4],
        options: [PATTERN_EMOJIS[3], PATTERN_EMOJIS[4], PATTERN_EMOJIS[0], PATTERN_EMOJIS[5]],
      },
      {
        sequence: [PATTERN_EMOJIS[2], PATTERN_EMOJIS[2], PATTERN_EMOJIS[5], PATTERN_EMOJIS[2], PATTERN_EMOJIS[2]],
        correctAnswer: PATTERN_EMOJIS[5],
        options: [PATTERN_EMOJIS[5], PATTERN_EMOJIS[2], PATTERN_EMOJIS[6], PATTERN_EMOJIS[7]],
      },
      {
        sequence: [PATTERN_EMOJIS[0], PATTERN_EMOJIS[1], PATTERN_EMOJIS[2], PATTERN_EMOJIS[0], PATTERN_EMOJIS[1]],
        correctAnswer: PATTERN_EMOJIS[2],
        options: [PATTERN_EMOJIS[2], PATTERN_EMOJIS[0], PATTERN_EMOJIS[1], PATTERN_EMOJIS[3]],
      },
    ];
  }

  if (lvl === 3) {
    return [
      {
        sequence: [PATTERN_EMOJIS[7], PATTERN_EMOJIS[6], PATTERN_EMOJIS[8], PATTERN_EMOJIS[7], PATTERN_EMOJIS[6]],
        correctAnswer: PATTERN_EMOJIS[8],
        options: [PATTERN_EMOJIS[6], PATTERN_EMOJIS[8], PATTERN_EMOJIS[7], PATTERN_EMOJIS[9]],
      },
      {
        sequence: [PATTERN_EMOJIS[9], PATTERN_EMOJIS[10], PATTERN_EMOJIS[11], PATTERN_EMOJIS[9], PATTERN_EMOJIS[10]],
        correctAnswer: PATTERN_EMOJIS[11],
        options: [PATTERN_EMOJIS[10], PATTERN_EMOJIS[11], PATTERN_EMOJIS[9], PATTERN_EMOJIS[4]],
      },
      {
        sequence: [PATTERN_EMOJIS[1], PATTERN_EMOJIS[1], PATTERN_EMOJIS[3], PATTERN_EMOJIS[1], PATTERN_EMOJIS[1]],
        correctAnswer: PATTERN_EMOJIS[3],
        options: [PATTERN_EMOJIS[3], PATTERN_EMOJIS[1], PATTERN_EMOJIS[2], PATTERN_EMOJIS[5]],
      },
    ];
  }

  // Procedural scaling for Levels 4-100
  const questionCount = Math.min(6, 3 + Math.floor(lvl / 15));
  const sequenceLen = Math.min(8, 4 + Math.floor(lvl / 10));
  const optionCount = Math.min(6, 4 + Math.floor(lvl / 20));

  const questions: PatternQuestion[] = [];
  for (let q = 0; q < questionCount; q++) {
    const itemA = PATTERN_EMOJIS[(q * 2) % PATTERN_EMOJIS.length];
    const itemB = PATTERN_EMOJIS[(q * 2 + 1) % PATTERN_EMOJIS.length];
    const itemC = PATTERN_EMOJIS[(q * 2 + 2) % PATTERN_EMOJIS.length];

    const seq: PatternItem[] = [];
    for (let i = 0; i < sequenceLen; i++) {
      if (lvl % 2 === 0) {
        seq.push(i % 2 === 0 ? itemA : itemB);
      } else {
        const patternUnit = [itemA, itemB, itemC];
        seq.push(patternUnit[i % 3]);
      }
    }

    const nextIndex = seq.length % (lvl % 2 === 0 ? 2 : 3);
    const correctAnswer = lvl % 2 === 0 ? (nextIndex === 0 ? itemA : itemB) : [itemA, itemB, itemC][nextIndex];

    const optionsSet = new Set<PatternItem>([correctAnswer]);
    for (let o = 0; optionsSet.size < optionCount && o < PATTERN_EMOJIS.length; o++) {
      optionsSet.add(PATTERN_EMOJIS[(q + o * 3) % PATTERN_EMOJIS.length]);
    }

    questions.push({
      sequence: seq,
      correctAnswer,
      options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    });
  }

  return questions;
};

// ==================== 3. DAILY ROUTINE RECALL GENERATOR ====================
export interface RoutineActivity {
  id: string;
  nameKey: string;
  emoji: string;
  correctOrder: number;
}

const ALL_ROUTINE_ACTIVITIES: RoutineActivity[] = [
  { id: 'wakeup', nameKey: 'routineStep1', emoji: '🌅', correctOrder: 1 },
  { id: 'teeth', nameKey: 'routineStep2', emoji: '🪥', correctOrder: 2 },
  { id: 'breakfast', nameKey: 'routineStep3', emoji: '🥣', correctOrder: 3 },
  { id: 'walk', nameKey: 'routineWalk', emoji: '🚶‍♂️', correctOrder: 4 },
  { id: 'medicine', nameKey: 'routineStep4', emoji: '💊', correctOrder: 5 },
  { id: 'reading', nameKey: 'routineReading', emoji: '📖', correctOrder: 6 },
  { id: 'dinner', nameKey: 'routineDinner', emoji: '🍲', correctOrder: 7 },
  { id: 'sleep', nameKey: 'routineSleep', emoji: '🌙', correctOrder: 8 },
];

export const getRoutineActivitiesForLevel = (level: number): RoutineActivity[] => {
  const lvl = Math.max(1, Math.min(100, level));

  let itemCount = 3;
  if (lvl === 1) itemCount = 3;      // 3 items
  else if (lvl === 2) itemCount = 4; // 4 items — DISTINCT FROM LEVEL 1!
  else if (lvl === 3) itemCount = 5; // 5 items
  else if (lvl === 4) itemCount = 6; // 6 items
  else if (lvl <= 10) itemCount = 6;
  else if (lvl <= 30) itemCount = 7;
  else itemCount = 8;

  const selected = ALL_ROUTINE_ACTIVITIES.slice(0, itemCount).map((item, idx) => ({
    ...item,
    correctOrder: idx + 1,
  }));

  return selected;
};

// ==================== 4. OBJECT RECOGNITION GENERATOR ====================
export interface ObjectQuestion {
  objectName: string;
  emoji: string;
  category: string;
  promptKey: string;
  options: string[];
}

const ALL_OBJECT_QUESTIONS: ObjectQuestion[] = [
  // Easy / Level 1
  { objectName: 'Mango', emoji: '🥭', category: 'Fresh Fruit', promptKey: 'objectInstructions', options: ['Mango', 'Apple', 'Cup'] },
  { objectName: 'Cup', emoji: '☕', category: 'Kitchenware', promptKey: 'objectInstructions', options: ['Book', 'Cup', 'Chair'] },
  { objectName: 'Clock', emoji: '⏰', category: 'Household Item', promptKey: 'objectInstructions', options: ['Clock', 'Umbrella', 'Flower'] },
  
  // Medium / Level 2
  { objectName: 'Book', emoji: '📖', category: 'Reading Item', promptKey: 'objectInstructions', options: ['Book', 'Paper', 'Magazine', 'Notebook'] },
  { objectName: 'Umbrella', emoji: '☂️', category: 'Weather Gear', promptKey: 'objectInstructions', options: ['Hat', 'Raincoat', 'Umbrella', 'Towel'] },
  { objectName: 'Chair', emoji: '🪑', category: 'Furniture', promptKey: 'objectInstructions', options: ['Table', 'Chair', 'Bed', 'Sofa'] },
  
  // Hard / Level 3+
  { objectName: 'Apple', emoji: '🍎', category: 'Fresh Fruit', promptKey: 'objectInstructions', options: ['Apple', 'Peach', 'Plum', 'Cherry', 'Pear'] },
  { objectName: 'Flower', emoji: '🌸', category: 'Nature', promptKey: 'objectInstructions', options: ['Rose', 'Tulip', 'Flower', 'Daisy', 'Lily'] },
];

export const getObjectQuestionsForLevel = (level: number): ObjectQuestion[] => {
  const lvl = Math.max(1, Math.min(100, level));

  if (lvl === 1) {
    return ALL_OBJECT_QUESTIONS.slice(0, 3); // 3 simple items (3 options each)
  }

  if (lvl === 2) {
    return ALL_OBJECT_QUESTIONS.slice(3, 6); // 3 items (4 options each) — DISTINCT FROM LEVEL 1!
  }

  if (lvl === 3) {
    return ALL_OBJECT_QUESTIONS.slice(2, 7); // 5 items (4-5 options each)
  }

  // Levels 4-100 scaling
  const count = Math.min(8, 3 + Math.floor(lvl / 12));
  const questions: ObjectQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const base = ALL_OBJECT_QUESTIONS[i % ALL_OBJECT_QUESTIONS.length];
    questions.push({
      ...base,
      promptKey: 'objectInstructions',
    });
  }

  return questions;
};
