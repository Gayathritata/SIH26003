import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/database';
import { seedDatabase } from './utils/seed';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Auto-seed demo database on startup for instant hackathon demo readiness
  try {
    await seedDatabase();
  } catch (err) {
    console.warn('[SERVER WARNING] Auto-seed error:', err);
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[MINDMATE NER BACKEND] Server running on port ${PORT}`);
    console.log(`[URL] http://localhost:${PORT}`);
    console.log(`[HEALTH] http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
};

startServer();
