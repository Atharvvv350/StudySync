import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './modules/auth/auth.model';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('--- START USER LIST ---');
        const users = await User.find({}).select('name email username');
        console.log(JSON.stringify(users, null, 2));
        console.log('--- END USER LIST ---');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
