import mongoose from 'mongoose';
import { User } from '../modules/auth/auth.model';
import { env } from '../config/env';

import fs from 'fs';

const checkUser = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        let output = 'Connected to MongoDB\n';

        const email = 'sahil141530@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            output += 'User Found:\n';
            output += `Name: ${user.name}\n`;
            output += `Email: ${user.email}\n`;
            output += `Username: ${user.username}\n`;
            output += `Role: ${user.role}\n`;
            output += `ID: ${user._id}\n`;
        } else {
            output += `No user found with email: ${email}\n`;
        }

        fs.writeFileSync('output.txt', output);

    } catch (error) {
        fs.writeFileSync('output.txt', `Error: ${error}`);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkUser();
