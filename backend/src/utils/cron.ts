import cron from 'node-cron';
import { User } from '../modules/auth/auth.model';
import { sendNotification } from '../modules/notifications/notifications.controller';

export const startCronJobs = () => {
    // Run every day at 9:00 AM
};
