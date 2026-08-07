import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer: MongoMemoryServer | null = null;

export async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (uri) {
    try {
      console.log('📡 Connecting to MongoDB Atlas / Remote database...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('⚠️ Remote MongoDB connection failed, falling back to local MongoDB Memory Server:', (err as Error).message);
    }
  }

  try {
    console.log('🚀 Starting local MongoDB Memory Server...');
    mongoMemoryServer = await MongoMemoryServer.create();
    const mongoUri = mongoMemoryServer.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to local MongoDB Memory Server successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Memory Server:', error);
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
}
