
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/auth/auth.model';

dotenv.config();

const migrateUsernames = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // 1. Admin (Sahil Narang) -> SahilA
        // Identify by email: sahil141530@gmail.com (from previous debug output)
        const admin = await User.findOne({ email: 'sahil141530@gmail.com' });
        if (admin) {
            admin.username = 'SahilA';
            await admin.save();
            console.log('Updated Admin username to SahilA');
        } else {
            console.log('Admin user not found');
        }

        // 2. Vansh Kapoor -> vansh123
        // Identify by email: vansh@gmail.com
        const vansh = await User.findOne({ email: 'vansh@gmail.com' });
        if (vansh) {
            vansh.username = 'vansh123';
            await vansh.save();
            console.log('Updated Vansh username to vansh123');
        } else {
            console.log('Vansh user not found');
        }

        // 3. Student (Sahil Narang) -> sahil4455
        // Identify by email: snarang445566@gmail.com
        const student = await User.findOne({ email: 'snarang445566@gmail.com' });
        if (student) {
            student.username = 'sahil4455';
            await student.save();
            console.log('Updated Student username to sahil4455');
        } else {
            console.log('Student user not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrateUsernames();
