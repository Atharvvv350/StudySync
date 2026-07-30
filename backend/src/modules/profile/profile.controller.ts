import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { User } from '../auth/auth.model';

export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        console.log("Update Profile Request:", req.body);
        console.log("User ID:", req.user._id);
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.grade = req.body.grade || user.grade;
            user.board = req.body.board || user.board;
            user.subjects = req.body.subjects || user.subjects;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                grade: updatedUser.grade,
                board: updatedUser.board,
                subjects: updatedUser.subjects,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
