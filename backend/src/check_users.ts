import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './modules/auth/auth.model';

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const users = await User.find({}).select('name email username role');
        console.log('Users found:', users.length);
        users.forEach(user => {
            console.log(`Name: ${user.name}, Email: ${user.email}, Username: ${user.username}, Role: ${user.role}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
