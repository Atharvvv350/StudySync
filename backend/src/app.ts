import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';

// Routes
import authRoutes from './modules/auth/auth.routes';
import profileRoutes from './modules/profile/profile.routes';
import studyMaterialRoutes from './modules/studyMaterial/studyMaterial.routes';
import quizRoutes from './modules/quiz/quiz.routes';
import forumRoutes from './modules/forum/forum.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notifications.routes';
import leaderboardRoutes from './modules/leaderboard/leaderboard.routes';


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:8080'],
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);


app.get('/', (req, res) => {
    res.send('StudySync API is running...');
});

export default app;
