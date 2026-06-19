import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
import initFirebase from './config/firebase.js';

const PORT = process.env.PORT || 5000;

// --------------- Bootstrap ---------------
const start = async () => {
  try {
    // 1. MongoDB
    await connectDB();

    // 2. Firebase Admin (does not require network at init time — will fail lazily on first API call if misconfigured)
    initFirebase();

    // 3. Express
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
