import express from 'express';
import { getAnalytics } from './analytics.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getAnalytics);

export default router;
