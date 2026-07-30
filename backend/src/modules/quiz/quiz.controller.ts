import { Request, Response } from 'express';
import { Quiz, QuizAttempt } from './quiz.model';
import { notifyAllStudents } from '../notifications/notifications.controller';
import { AuthRequest } from '../../middleware/auth.middleware';
import { User } from '../auth/auth.model';

export const createQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, board, grade, subject, chapter, topic, duration, questions } = req.body;

        const quiz = await Quiz.create({
            title,
            description,
            board,
            grade,
            subject,
            chapter,
            topic,
            duration: duration || 20,
            maxAttempts: req.body.maxAttempts || null,
            questions,
            createdBy: req.user._id,
        });

        // Notify all students
        await notifyAllStudents(`New Quiz: ${title} (${subject})`, 'alert');

        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getQuizzes = async (req: AuthRequest, res: Response) => {
    try {
        const { board, grade, subject, chapter, topic, limit } = req.query;
        const query: any = {};

        if (board) query.board = board;
        if (grade) query.grade = grade;
        if (subject) query.subject = subject;
        if (chapter) query.chapter = chapter;
        if (topic) query.topic = topic;

        const quizQuery = Quiz.find(query).populate('createdBy', 'name').lean();

        if (limit) {
            quizQuery.limit(Number(limit));
        }

        const quizzes = await quizQuery;

        // Get attempts for the current user
        const userAttempts = await QuizAttempt.find({ student: req.user._id });

        // Create a map of quizId -> attempt count
        const attemptMap = new Map();
        userAttempts.forEach(attempt => {
            const qId = attempt.quiz.toString();
            attemptMap.set(qId, (attemptMap.get(qId) || 0) + 1);
        });

        // Add attemptsTaken to each quiz
        const quizzesWithAttempts = quizzes.map((quiz: any) => ({
            ...quiz,
            attemptsTaken: attemptMap.get(quiz._id.toString()) || 0
        }));

        res.json(quizzesWithAttempts);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getQuizById = async (req: Request, res: Response) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
        if (quiz) {
            res.json(quiz);
        } else {
            res.status(404).json({ message: 'Quiz not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const attemptQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { quizId, answers } = req.body; // answers: [{ questionIndex: number, selectedOption: number }]
        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Check Max Attempts
        if (quiz.maxAttempts) {
            const previousAttempts = await QuizAttempt.countDocuments({ student: req.user._id, quiz: quizId });
            if (previousAttempts >= quiz.maxAttempts) {
                return res.status(403).json({ message: `Maximum attempts (${quiz.maxAttempts}) reached for this quiz.` });
            }
        }

        let score = 0;
        const processedAnswers = answers.map((ans: any) => {
            const question = quiz.questions[ans.questionIndex];
            const isCorrect = question.correctOption === ans.selectedOption;
            if (isCorrect) score++;
            return {
                questionId: (question as any)._id,
                selectedOption: ans.selectedOption,
                isCorrect,
            };
        });

        const attempt = await QuizAttempt.create({
            student: req.user._id,
            quiz: quizId,
            score,
            totalQuestions: quiz.questions.length,
            answers: processedAnswers,
        });

        const xpGained = score * 1;
        console.log(`[Quiz Attempt] User: ${req.user._id}, Score: ${score}, XP Gained: ${xpGained}`);

        // Update User XP
        const user = await User.findById(req.user._id);
        if (user) {
            if (typeof user.xp !== 'number' || isNaN(user.xp)) {
                console.log(`[Quiz Attempt] Initializing XP for user ${user._id}`);
                user.xp = 0;
            }
            const oldXp = user.xp;
            user.xp += xpGained;

            // Badge Logic
            const badges = user.badges || [];
            if (user.xp >= 100 && !badges.includes('Bronze Scholar')) {
                badges.push('Bronze Scholar');
            }
            if (user.xp >= 200 && !badges.includes('Silver Scholar')) {
                badges.push('Silver Scholar');
            }
            if (user.xp >= 400 && !badges.includes('Gold Scholar')) {
                badges.push('Gold Scholar');
            }
            if (user.xp >= 1000 && !badges.includes('Diamond Scholar')) {
                badges.push('Diamond Scholar');
            }
            user.badges = badges;

            await user.save();
            console.log(`[Quiz Attempt] XP Updated: ${oldXp} -> ${user.xp}, Badges: ${user.badges.join(', ')}`);
        } else {
            console.error(`[Quiz Attempt] User not found: ${req.user._id}`);
        }

        res.status(201).json({ ...attempt.toObject(), xpGained });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getAllQuizAttempts = async (req: Request, res: Response) => {
    try {
        const attempts = await QuizAttempt.find()
            .populate('student', 'name email username')
            .populate('quiz', 'title subject grade')
            .sort({ completedAt: -1 });
        res.json(attempts);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const seedQuiz = async (req: Request, res: Response) => {
    try {
        const user = await User.findOne();
        if (!user) {
            return res.status(404).json({ message: 'No user found to assign as creator' });
        }

        const sampleQuiz = {
            title: "General Science Knowledge",
            description: "A quick test of your basic science knowledge.",
            board: "CBSE",
            grade: "10",
            subject: "Science",
            chapter: "General",
            topic: "Basics",
            questions: [
                {
                    questionText: "What is the chemical symbol for Gold?",
                    options: ["Ag", "Au", "Fe", "Cu"],
                    correctOption: 1,
                    explanation: "Au is the symbol for Gold, derived from the Latin word Aurum."
                },
                {
                    questionText: "Which planet is known as the Red Planet?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correctOption: 1,
                    explanation: "Mars is often called the Red Planet because the iron oxide prevalent on its surface gives it a reddish appearance."
                },
                {
                    questionText: "What is the powerhouse of the cell?",
                    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
                    correctOption: 1,
                    explanation: "Mitochondria are known as the powerhouses of the cell because they generate most of the cell's supply of adenosine triphosphate (ATP)."
                },
                {
                    questionText: "What is the speed of light?",
                    options: ["3 x 10^8 m/s", "3 x 10^6 m/s", "3 x 10^5 km/s", "Both A and C"],
                    correctOption: 3,
                    explanation: "The speed of light is approximately 3 x 10^8 meters per second, which is equal to 3 x 10^5 kilometers per second."
                },
                {
                    questionText: "Which gas is most abundant in the Earth's atmosphere?",
                    options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
                    correctOption: 2,
                    explanation: "Nitrogen makes up about 78% of Earth's atmosphere."
                }
            ],
            createdBy: user._id as any,
            duration: 10
        };

        const createdQuiz = await Quiz.create(sampleQuiz);
        res.status(201).json(createdQuiz);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, board, grade, subject, chapter, topic, duration, maxAttempts, questions } = req.body;
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this quiz' });
        }

        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;
        quiz.board = board || quiz.board;
        quiz.grade = grade || quiz.grade;
        quiz.subject = subject || quiz.subject;
        quiz.chapter = chapter || quiz.chapter;
        quiz.topic = topic || quiz.topic;
        quiz.duration = duration || quiz.duration;
        quiz.maxAttempts = maxAttempts !== undefined ? maxAttempts : quiz.maxAttempts;
        quiz.questions = questions || quiz.questions;

        await quiz.save();
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        if (quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await quiz.deleteOne();
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
