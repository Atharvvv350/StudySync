
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/auth/auth.model';

dotenv.config();

const debugUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('--- ALL USERS ---');
        const fs = require('fs');
        fs.writeFileSync('users_dump.json', JSON.stringify(users, null, 2));
        console.log('Users written to users_dump.json');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugUsers();
