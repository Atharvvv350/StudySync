import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

export const verifyToken = (token: string) => {
    return jwt.verify(token, env.JWT_SECRET);
};
