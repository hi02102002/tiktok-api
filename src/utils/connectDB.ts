import mongoose from 'mongoose';
import logger from './logger';

const connectDB = async () => {
   const url = process.env.DB_URL_LOCAL as string;
   try {
      await mongoose.connect(url);
      logger.info('MongoDB connected');
   } catch (error) {
      logger.error('MongoDB disconnected');
   }
};

export default connectDB;
