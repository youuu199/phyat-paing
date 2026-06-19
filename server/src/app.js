import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.js';
import billRoutes from './routes/billRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------- Routes ---------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bill Organizer API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bills', billRoutes);

// --------------- Error handler ---------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
