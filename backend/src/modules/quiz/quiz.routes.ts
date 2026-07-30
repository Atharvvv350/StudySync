import express from 'express';
import { createQuiz, getQuizzes, getQuizById, attemptQuiz, seedQuiz, getAllQuizAttempts, updateQuiz, deleteQuiz } from './quiz.controller';
import { protect, authorize } from '../../middleware/auth.middleware';

const router = express.Router();

router.post('/seed', seedQuiz);
router.post('/', protect, authorize('admin'), createQuiz);
router.get('/', protect, getQuizzes);
router.get('/admin/results', protect, authorize('admin'), getAllQuizAttempts);
router.get('/:id', protect, getQuizById);
router.put('/:id', protect, authorize('admin'), updateQuiz);
router.delete('/:id', protect, authorize('admin'), deleteQuiz);
router.post('/attempt', protect, attemptQuiz);

export default router;
