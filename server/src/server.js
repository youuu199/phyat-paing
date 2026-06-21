import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import connectDB from './config/db.js';
import { shutdownOCR } from './utils/ocrService.js';
import { startRecurringService } from './utils/recurringService.js';

const PORT = process.env.PORT || 5000;

// --------------- Graceful shutdown ---------------
async function gracefulShutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully...`);

  try {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');

    // Terminate Tesseract workers
    await shutdownOCR();

    console.log('Graceful shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err.message);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// --------------- Bootstrap ---------------
const start = async () => {
  try {
    // 1. MongoDB
    await connectDB();

    // 2. Express
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // 3. Recurring bill service
    startRecurringService();
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
