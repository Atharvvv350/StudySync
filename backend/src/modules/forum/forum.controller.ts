import { Request, Response } from 'express';
import { Question } from './forum.model';
import { AuthRequest } from '../../middleware/auth.middleware';

import { sendNotification } from '../notifications/notifications.controller';

export const createQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, tags } = req.body;
        const question = await Question.create({
            title,
            description,
            tags,
            askedBy: req.user._id,
            image: req.file ? req.file.path : undefined,
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await Question.find()
            .populate('askedBy', 'name username')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getQuestionById = async (req: Request, res: Response) => {
    try {
        const question = await Question.findById(req.params.id)
            .populate('askedBy', 'name username')
            .populate('answers.answeredBy', 'name username');
        if (question) {
            question.views += 1;
            await question.save();
            res.json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description, tags } = req.body;
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.askedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this question' });
        }

        question.title = title || question.title;
        question.description = description || question.description;
        question.tags = tags || question.tags;
        if (req.file) {
            question.image = req.file.path;
        }

        await question.save();
        res.json(question);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const deleteQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }

        if (question.askedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this question' });
        }

        await question.deleteOne();
        res.json({ message: 'Question deleted' });
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const addAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { text } = req.body;
        const question = await Question.findById(req.params.id);

        if (question) {
            const answer = {
                text,
                answeredBy: req.user._id,
                upvotes: [],
                isVerified: false,
                image: req.file ? req.file.path : undefined,
            };
            question.answers.push(answer as any);
            await question.save();

            // Send notification to the question asker
            if (question.askedBy.toString() !== req.user._id.toString()) {
                await sendNotification(
                    question.askedBy.toString(),
                    `New answer on your question: "${question.title}"`,
                    'info'
                );
            }

            res.status(201).json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const upvoteAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { questionId, answerId } = req.params;
        const question = await Question.findById(questionId);

        if (question) {
            const answer = (question.answers as any).id(answerId);
            if (answer) {
                if (answer.upvotes.includes(req.user._id)) {
                    return res.status(400).json({ message: 'Already upvoted' });
                }
                answer.upvotes.push(req.user._id);
                await question.save();
                res.json(question);
            } else {
                res.status(404).json({ message: 'Answer not found' });
            }
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const verifyAnswer = async (req: AuthRequest, res: Response) => {
    try {
        const { questionId, answerId } = req.params;
        const question = await Question.findById(questionId);

        if (question) {
            const answer = (question.answers as any).id(answerId);
            if (answer) {
                answer.isVerified = true;
                await question.save();
                res.json(question);
            } else {
                res.status(404).json({ message: 'Answer not found' });
            }
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
