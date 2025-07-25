import mongoose from 'mongoose';

export const connectToDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/namingops';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectToDatabase;
