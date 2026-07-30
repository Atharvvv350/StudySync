import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { QuizAttempt } from '../quiz/quiz.model';
import { StudyMaterial } from '../studyMaterial/studyMaterial.model';
import { Question } from '../forum/forum.model';
import { User } from '../auth/auth.model';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user._id;

        // Quiz Performance
        const attempts = await QuizAttempt.find({ student: userId }).populate('quiz');
        const totalQuizzes = attempts.length;
        const totalScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
        const totalPossibleScore = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
        const averageAccuracy = totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 0;

        // Subject-wise Performance
        const subjectPerformance: any = {};
        attempts.forEach((attempt: any) => {
            if (!attempt.quiz) return; // Skip if quiz was deleted

            const subject = attempt.quiz.subject;
            if (!subjectPerformance[subject]) {
                subjectPerformance[subject] = { score: 0, total: 0 };
            }
            subjectPerformance[subject].score += attempt.score;
            subjectPerformance[subject].total += attempt.totalQuestions;
        });

        const subjectAnalytics = Object.keys(subjectPerformance).map((subject) => ({
            subject,
            accuracy: (subjectPerformance[subject].score / subjectPerformance[subject].total) * 100,
        }));

        // Calculate Improvement (Last 5 quizzes vs Previous quizzes)
        let improvement = 0;
        if (attempts.length >= 2) {
            // Sort attempts by date (newest first) - assuming createdAt exists
            // If createdAt is not populated, we might rely on natural order or need to sort. 
            // QuizAttempt schema has timestamps: true usually.
            // Let's assume natural order is insertion order which is roughly chronological.
            // Better to be safe and sort if possible, but attempts comes from find() which might not be sorted.
            // Let's sort in memory to be safe.
            const sortedAttempts = attempts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            const recentAttempts = sortedAttempts.slice(0, 5);
            const recentScore = recentAttempts.reduce((acc: number, curr: any) => acc + (curr.score / curr.totalQuestions) * 100, 0);
            const recentAverage = recentScore / recentAttempts.length;

            const previousAttempts = sortedAttempts.slice(5);
            let previousAverage = 0;

            if (previousAttempts.length > 0) {
                const previousScore = previousAttempts.reduce((acc: number, curr: any) => acc + (curr.score / curr.totalQuestions) * 100, 0);
                previousAverage = previousScore / previousAttempts.length;
                improvement = recentAverage - previousAverage;
            } else {
                // If less than 6 quizzes, compare recent (all) to 0 or just set to recentAverage?
                // Or maybe compare last quiz to average of all previous?
                // Let's just say improvement is 0 if not enough history, or maybe compare to first half?
                // Let's keep it simple: if no previous attempts, improvement is just the average (starting from 0).
                improvement = recentAverage;
            }
        }

        // Forum Activity
        const questionsAsked = await Question.countDocuments({ askedBy: userId });

        // Study Material Views (This would require a separate tracking model for user views, 
        // but for now we can just return global stats or skip it as per requirements "Track student progress")
        // Assuming we want to track what the student has viewed, we would need a UserActivity model.
        // For now, let's stick to Quiz performance as the main analytic.

        // Calculate Rank (Break ties by createdAt)
        // Count users with MORE XP
        const betterPlayers = await User.countDocuments({
            role: { $in: ['student', 'admin'] },
            $or: [
                { xp: { $gt: req.user.xp || 0 } },
                { xp: { $eq: req.user.xp || 0 }, createdAt: { $lt: req.user.createdAt } } // Tie-breaker: Older account wins
            ]
        });
        const rank = betterPlayers + 1;

        console.log(`[Analytics] User: ${userId}, XP: ${req.user.xp}, Rank: ${rank}`);

        res.json({
            totalQuizzes,
            averageAccuracy,
            subjectAnalytics,
            questionsAsked,
            xp: req.user.xp,
            rank,
            improvement,
        });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
