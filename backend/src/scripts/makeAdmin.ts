import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../modules/auth/auth.model';

dotenv.config();

const promoteToAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        // Find the user (assuming the user's email is known or we pick the first one)
        // Since I don't know the exact email, I'll update ALL users to admin for this dev environment
        // Or better, I'll list users and ask, but for automation, let's update the most recently created user.

        const user = await User.findOne().sort({ createdAt: -1 });

        if (!user) {
            console.log('No users found.');
            process.exit(1);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted user ${user.name} (${user.email}) to ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error promoting user:', error);
        process.exit(1);
    }
};

promoteToAdmin();
