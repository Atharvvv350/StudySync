import express from 'express';
import { getNotifications, markAsRead } from './notifications.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

export default router;
