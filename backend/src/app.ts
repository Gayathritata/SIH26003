import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { isDBConnected } from './config/database';
import authRoutes from './routes/authRoutes';
import patientRoutes from './routes/patientRoutes';
import gameRoutes from './routes/gameRoutes';
import reminderRoutes from './routes/reminderRoutes';
import moodRoutes from './routes/moodRoutes';
import syncRoutes from './routes/syncRoutes';
import alertRoutes from './routes/alertRoutes';
import dashboardRoutes from './routes/dashboardRoutes';

const app: Application = express();

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  process.env.FRONTEND_URL,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        /\.vercel\.app$/.test(origin) ||
        process.env.NODE_ENV !== 'production';

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback to allow all origins in hackathon/demo mode
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoints
const handleHealthCheck = (req: Request, res: Response) => {
  const dbConnected = isDBConnected();
  res.json({
    status: 'online',
    service: 'MINDMATE NER Backend API',
    mongodb: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    disclaimer: 'Supportive cognitive companion API. NOT a medical diagnostic tool.',
  });
};

app.get('/', handleHealthCheck);
app.get('/api', handleHealthCheck);
app.get('/health', handleHealthCheck);
app.get('/api/health', handleHealthCheck);


// API Routes (supports both /auth and /api/auth)
app.use('/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/api/patients', patientRoutes);
app.use('/games', gameRoutes);
app.use('/api/games', gameRoutes);
app.use('/reminders', reminderRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/mood', moodRoutes);
app.use('/api/mood', moodRoutes);
app.use('/sync', syncRoutes);
app.use('/api/sync', syncRoutes);
app.use('/alerts', alertRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[UNHANDLED BACKEND ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected system error occurred. Please try again or check your connectivity.',
  });
});

export default app;
