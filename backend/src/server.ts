import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { startCronJobs } from './utils/cron';

const startServer = async () => {
    await connectDB();
    startCronJobs();

    app.listen(env.PORT, () => {
        console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
};

startServer();
