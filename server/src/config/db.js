import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose.
 * Uses MONGODB_URI from environment variables.
 * Falls back to mongodb-memory-server if Atlas is unreachable.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // Try Atlas / configured URI first
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.warn(`Atlas unreachable (${err.message}), falling back to local in-memory MongoDB...`);
    }
  }

  // Fallback: local in-memory MongoDB via mongodb-memory-server
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const fallbackUri = mongod.getUri();
    const conn = await mongoose.connect(fallbackUri);
    console.log(`MongoDB connected (local in-memory): ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
