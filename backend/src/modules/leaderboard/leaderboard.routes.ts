import express from 'express';
import { getLeaderboard } from './leaderboard.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getLeaderboard);

export default router;
