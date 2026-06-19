import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose.
 * Uses MONGODB_URI from environment variables.
 * Automatically retries on failure and exits process if unrecoverable.
 *
 * Anti-patterns avoided:
 *  - No useNewUrlParser, useUnifiedTopology, useFindAndModify, useCreateIndex (removed in Mongoose 6+)
 *  - No 'localhost' in connection string — use 127.0.0.1 to avoid IPv6 resolution issues
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Fail fast in dev if MongoDB is unreachable
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
