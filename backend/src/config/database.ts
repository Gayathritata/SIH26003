import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.warn('[DATABASE WARNING] MONGODB_URI is not defined in environment variables. Falling back to mongodb://localhost:27017/mindmate_ner');
  }

  const targetUri = connUri || 'mongodb://localhost:27017/mindmate_ner';

  try {
    await mongoose.connect(targetUri);
    console.log(`[DATABASE SUCCESS] MongoDB Connected successfully! Host: ${mongoose.connection.host}, Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[DATABASE ERROR] MongoDB connection failed: ${(error as Error).message}`);
  }
};

export const isDBConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

