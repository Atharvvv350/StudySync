import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { StudyMaterial } from '../modules/studyMaterial/studyMaterial.model';
import { Quiz, QuizAttempt } from '../modules/quiz/quiz.model';

dotenv.config();

const cleanData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('Connected to MongoDB');

        const allowedSubjects = ['Physics', 'Chemistry', 'Mathematics', 'Biology'];

        // 1. Clean Study Materials
        const materialsResult = await StudyMaterial.deleteMany({
            subject: { $nin: allowedSubjects }
        }) as any;
        console.log(`Deleted ${materialsResult.deletedCount} legacy Study Materials.`);

        // 2. Clean Quizzes
        const quizzesResult = await Quiz.deleteMany({
            subject: { $nin: allowedSubjects }
        }) as any;
        console.log(`Deleted ${quizzesResult.deletedCount} legacy Quizzes.`);

        // 3. Clean Orphaned Quiz Attempts (where quiz no longer exists)
        // First, get all valid quiz IDs
        const validQuizzes = await Quiz.find({}, '_id');
        const validQuizIds = validQuizzes.map(q => q._id);

        const attemptsResult = await QuizAttempt.deleteMany({
            quiz: { $nin: validQuizIds as any }
        }) as any;
        console.log(`Deleted ${attemptsResult.deletedCount} orphaned Quiz Attempts.`);

        console.log('Cleanup complete!');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanData();
