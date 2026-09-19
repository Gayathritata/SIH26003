import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { connectDB } from '../config/database';
import User from '../models/User';
import PatientProfile from '../models/PatientProfile';
import CaregiverPatient from '../models/CaregiverPatient';
import GameSession from '../models/GameSession';
import GameContent from '../models/GameContent';
import Reminder from '../models/Reminder';
import MoodLog from '../models/MoodLog';
import Alert from '../models/Alert';

export const seedDatabase = async () => {
  await connectDB();
  console.log('[SEED] Starting Hackathon Demo Database Seeding...');

  // Clear existing demo records
  await User.deleteMany({});
  await PatientProfile.deleteMany({});
  await CaregiverPatient.deleteMany({});
  await GameSession.deleteMany({});
  await GameContent.deleteMany({});
  await Reminder.deleteMany({});
  await MoodLog.deleteMany({});
  await Alert.deleteMany({});

  const defaultPasswordHash = await bcrypt.hash('MindMate@2026', 10);

  // 1. Create Demo Elderly User ("Asha Devi")
  const patientUser = await User.create({
    firebaseUid: 'demo_patient_uid',
    name: 'Asha Devi',
    email: 'asha.devi@demo.mindmate',
    passwordHash: defaultPasswordHash,
    role: 'elderly',
    language: 'te',
    region: 'South_NER',
  });

  const patientProfile = await PatientProfile.create({
    userId: patientUser._id,
    firebaseUid: patientUser.firebaseUid,
    age: 74,
    region: 'Assam_NER',
    language: 'en',
    cognitiveLevel: 3,
    memoryScore: 78,
    attentionScore: 82,
    recognitionScore: 85,
    responseScore: 74,
    consistencyScore: 80,
    engagementScore: 88,
  });

  // 2. Create Demo Caregiver ("Demo Caregiver")
  const caregiverUser = await User.create({
    firebaseUid: 'demo_caregiver_uid',
    name: 'Demo Caregiver',
    email: 'caregiver@demo.mindmate',
    passwordHash: defaultPasswordHash,
    role: 'caregiver',
    language: 'en',
    region: 'Assam_NER',
  });

  await CaregiverPatient.create({
    caregiverId: caregiverUser.firebaseUid,
    patientId: patientUser.firebaseUid,
    relationship: 'Son / Family Caregiver',
  });

  // 3. Cultural Content Engine Seed (NE India objects, fruits, wild animals, locations)
  const culturalItems = [
    {
      gameType: 'object_rec',
      region: 'Assam_NER',
      language: 'en',
      category: 'traditional_objects',
      question: 'Identify this traditional North-Eastern headgear woven from bamboo and palm leaves:',
      options: ['Jhapi', 'Pugree', 'Topi', 'Gamucha'],
      correctAnswer: 'Jhapi',
      image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400',
      difficulty: 1,
    },
    {
      gameType: 'object_rec',
      region: 'Assam_NER',
      language: 'en',
      category: 'cultural_fabric',
      question: 'Identify this famous natural silk variety indigenous to Assam:',
      options: ['Eri Silk', 'Cotton', 'Wool', 'Nylon'],
      correctAnswer: 'Eri Silk',
      image: 'https://images.unsplash.com/photo-1606744888344-493238951221?w=400',
      difficulty: 2,
    },
    {
      gameType: 'object_rec',
      region: 'Assam_NER',
      language: 'en',
      category: 'wildlife',
      question: 'Identify this iconic animal found in Kaziranga National Park:',
      options: ['One-Horned Rhinoceros', 'Bengal Tiger', 'Snow Leopard', 'Asian Elephant'],
      correctAnswer: 'One-Horned Rhinoceros',
      image: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=400',
      difficulty: 1,
    },
    {
      gameType: 'object_rec',
      region: 'Assam_NER',
      language: 'en',
      category: 'natural_environment',
      question: 'Identify this famous freshwater lake in Manipur known for floating phumdis:',
      options: ['Loktak Lake', 'Umiam Lake', 'Dal Lake', 'Chilika Lake'],
      correctAnswer: 'Loktak Lake',
      difficulty: 2,
    },
    {
      gameType: 'routine',
      region: 'Assam_NER',
      language: 'en',
      category: 'daily_routine',
      question: 'What activity comes right after Breakfast in the morning schedule?',
      options: ['Morning Medicine 💊', 'Take a Walk 🚶', 'Go to Sleep 😴', 'Dinner 🍲'],
      correctAnswer: 'Morning Medicine 💊',
      difficulty: 1,
    },
    {
      gameType: 'pattern',
      region: 'Assam_NER',
      language: 'en',
      category: 'pattern_rec',
      question: 'Complete the pattern: 🍃 Tea Leaf ➔ 🎋 Bamboo ➔ 🍃 Tea Leaf ➔ 🎋 Bamboo ➔ ?',
      options: ['🍃 Tea Leaf', '🐟 Fish', '🍎 Apple', '🏠 House'],
      correctAnswer: '🍃 Tea Leaf',
      difficulty: 1,
    },
  ];

  await GameContent.insertMany(culturalItems);

  // 4. Historical Game Sessions (for real dynamic baseline & analytics)
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;

  const historicalSessions = [
    {
      patientId: 'demo_patient_uid',
      gameType: 'memory',
      difficulty: 2,
      score: 85,
      accuracy: 0.85,
      reactionTime: 3.8,
      mistakes: 1,
      completionRate: 1.0,
      duration: 40,
      mood: 'good',
      aiRecommendedDifficulty: 3,
      aiConfidence: 0.89,
      aiReason: 'High accuracy and prompt reaction time recorded.',
      createdAt: new Date(now - 4 * oneDay),
    },
    {
      patientId: 'demo_patient_uid',
      gameType: 'pattern',
      difficulty: 3,
      score: 90,
      accuracy: 0.90,
      reactionTime: 3.2,
      mistakes: 0,
      completionRate: 1.0,
      duration: 35,
      mood: 'happy',
      aiRecommendedDifficulty: 3,
      aiConfidence: 0.92,
      aiReason: 'Excellent accuracy maintained.',
      createdAt: new Date(now - 3 * oneDay),
    },
    {
      patientId: 'demo_patient_uid',
      gameType: 'routine',
      difficulty: 3,
      score: 80,
      accuracy: 0.80,
      reactionTime: 4.1,
      mistakes: 1,
      completionRate: 1.0,
      duration: 45,
      mood: 'okay',
      aiRecommendedDifficulty: 3,
      aiConfidence: 0.87,
      aiReason: 'Consistent performance on daily routine sequencing.',
      createdAt: new Date(now - 2 * oneDay),
    },
    {
      patientId: 'demo_patient_uid',
      gameType: 'object_rec',
      difficulty: 3,
      score: 88,
      accuracy: 0.88,
      reactionTime: 3.5,
      mistakes: 1,
      completionRate: 1.0,
      duration: 42,
      mood: 'happy',
      aiRecommendedDifficulty: 3,
      aiConfidence: 0.91,
      aiReason: 'Cultural object recognition completed easily.',
      createdAt: new Date(now - 1 * oneDay),
    },
  ];

  await GameSession.insertMany(historicalSessions);

  // 5. Prepopulate Reminders
  const remindersData = [
    {
      patientId: 'demo_patient_uid',
      type: 'medicine',
      title: '💊 Morning Blood Pressure Medication',
      description: 'Take 1 tablet with warm water after breakfast.',
      scheduledTime: '08:00 AM',
      status: 'completed',
    },
    {
      patientId: 'demo_patient_uid',
      type: 'hydration',
      title: '💧 Hydration Break',
      description: 'Drink 1 full glass of water.',
      scheduledTime: '10:30 AM',
      status: 'completed',
    },
    {
      patientId: 'demo_patient_uid',
      type: 'activity',
      title: '🧠 Cognitive Brain Training Session',
      description: 'Play Memory Match & Routine Recall activities.',
      scheduledTime: '04:00 PM',
      status: 'pending',
    },
    {
      patientId: 'demo_patient_uid',
      type: 'appointment',
      title: '👨‍⚕️ Telehealth Check-in with Dr. Barua',
      description: 'Routine wellness consultation via video call.',
      scheduledTime: '06:30 PM',
      status: 'pending',
    },
  ];

  await Reminder.insertMany(remindersData);

  // 6. Prepopulate Mood Logs
  await MoodLog.create({ patientId: 'demo_patient_uid', mood: 'happy', createdAt: new Date(now - 2 * oneDay) });
  await MoodLog.create({ patientId: 'demo_patient_uid', mood: 'good', createdAt: new Date(now - 1 * oneDay) });
  await MoodLog.create({ patientId: 'demo_patient_uid', mood: 'okay', createdAt: new Date() });

  // 7. Prepopulate Actionable Performance Alert
  await Alert.create({
    patientId: 'demo_patient_uid',
    alertType: 'performance_change',
    message: 'Notice: Today\'s routine recall speed showed slight baseline variation. Engagement remains strong.',
    severity: 'low',
    status: 'active',
  });

  console.log('[SEED SUCCESS] Hackathon demo dataset seeded successfully!');
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('[SEED ERROR]', err);
    process.exit(1);
  });
}
