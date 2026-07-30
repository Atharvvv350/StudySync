import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`MongoDB Connection State: ${mongoose.connection.readyState}`); // 1 = connected
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        process.exit(1);
    }
};
