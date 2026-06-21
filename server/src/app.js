import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import logger from './utils/logger.js';
import uploadRoutes from './routes/upload.js';
import billRoutes from './routes/billRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// --------------- Request logging ---------------
app.use(pinoHttp({ logger }));

// --------------- Middleware ---------------
const REQUEST_TIMEOUT = 120000; // 2 minutes — upload pipeline (Cloudinary+OCR+AI) can be slow

app.use((req, res, next) => {
  req.setTimeout(REQUEST_TIMEOUT, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Request timeout — the server took too long to respond' });
    }
  });
  next();
});

const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (() => {
        if (!process.env.FRONTEND_URL) {
          console.error('FATAL: FRONTEND_URL is not set in production');
          process.exit(1);
        }
        return process.env.FRONTEND_URL;
      })()
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API v1 routes (versioned)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/bills', billRoutes);

// Legacy routes (backward compatibility — redirects to v1)
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bills', billRoutes);

// --------------- Error handler ---------------
app.use((err, req, res, next) => {
  // Log the error with request context
  req.log.error({ err }, 'Request error');

  const statusCode = err.status || 500;

  // In production, send generic error messages to avoid leaking internals
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({ error: message });
});

export default app;
