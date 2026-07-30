import { Request, Response } from 'express';
import { User } from '../auth/auth.model';

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { type } = req.query; // 'global' or 'subject' (subject not implemented in User model yet for subject-wise XP)

        // For now, only global XP leaderboard
        const leaderboard = await User.find({ role: { $in: ['student', 'admin'] } })
            .sort({ xp: -1, createdAt: 1 }) // Tie-breaker: Older account wins
            .limit(10)
            .select('name username xp badges grade board');

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
