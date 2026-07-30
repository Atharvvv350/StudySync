import { Request, Response } from 'express';
import dns from 'dns';
import net from 'net';
import nodemailer from 'nodemailer';
import { User } from './auth.model';
import { Otp } from './otp.model';
import { generateToken } from '../../utils/jwt';
import { AuthRequest } from '../../middleware/auth.middleware';
import { sendEmail } from '../../utils/email';
import { env } from '../../config/env';

export const sendSignupOtp = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Upsert OTP (update if exists, create if not)
        await Otp.findOneAndUpdate(
            { email },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // ALWAYS Log OTP to console (Fallback for blocked SMTP)
        console.log(`==================================================`);
        console.log(`[OTP] Generated for ${email}: ${otp}`);
        console.log(`==================================================`);

        try {
            await sendEmail(email, 'StudySync - Signup Verification', `Your verification code is: ${otp}`);
        } catch (emailError) {
            console.error('Email sending failed (using console log fallback):', emailError);
            // Do NOT return error to client, allow them to use the console OTP
        }

        res.json({ message: 'OTP generated. If email fails, check server logs.' });

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const verifySignupOtp = async (req: Request, res: Response) => {
    const { email, otp } = req.body;

    try {
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.status(400).json({ message: 'OTP expired or not found' });
        }

        if (otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.json({ message: 'OTP verified successfully' });

    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const register = async (req: Request, res: Response) => {
    const { name, email, password, username, otp } = req.body;

    try {
        // Final verification before creation
        const otpRecord = await Otp.findOne({ email });
        if (!otpRecord || otpRecord.otp !== otp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' });
        }

        const user = await User.create({
            name,
            email,
            password,
            username,
            role: 'student',
            isVerified: true, // Verified during signup
        });

        if (user) {
            // Delete used OTP
            await Otp.deleteOne({ email });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken((user._id as unknown) as string, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            // Optional: Check isVerified if you want to enforce it for old users too
            // if (!user.isVerified) { ... } 

            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken((user._id as unknown) as string, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

export const testEmailConnection = async (req: Request, res: Response) => {
    const logs: string[] = [];
    const log = (msg: string) => logs.push(`[${new Date().toISOString()}] ${msg}`);

    try {
        log('Starting Email Diagnostic...');

        // 1. Check Environment Variables
        log(`EMAIL_USER: ${env.EMAIL_USER ? 'Set' : 'Missing'}`);
        log(`EMAIL_PASS: ${env.EMAIL_PASS ? 'Set' : 'Missing'}`);
        if (env.EMAIL_PASS) {
            log(`EMAIL_PASS Length: ${env.EMAIL_PASS.length}`);
            log(`EMAIL_PASS has spaces: ${env.EMAIL_PASS.includes(' ')}`);
        }

        // 2. DNS Resolution
        log('Resolving smtp.gmail.com...');
        try {
            const addresses = await new Promise<string[]>((resolve, reject) => {
                dns.resolve('smtp.gmail.com', (err, addresses) => {
                    if (err) reject(err);
                    else resolve(addresses);
                });
            });
            log(`DNS Resolution Success: ${JSON.stringify(addresses)}`);
        } catch (err) {
            log(`DNS Resolution Failed: ${(err as Error).message}`);
        }

        // 3. Socket Connection Test (Port 465 & 587)
        log('Testing TCP Connection to smtp.gmail.com:465...');
        try {
            await new Promise<void>((resolve, reject) => {
                const socket = new net.Socket();
                socket.setTimeout(5000);
                socket.on('connect', () => { log('Port 465: Connected!'); socket.destroy(); resolve(); });
                socket.on('timeout', () => { socket.destroy(); reject(new Error('Timeout')); });
                socket.on('error', (err) => reject(err));
                socket.connect(465, 'smtp.gmail.com');
            });
        } catch (err) {
            log(`Port 465 Failed: ${(err as Error).message}`);
        }

        log('Testing TCP Connection to smtp.gmail.com:587...');
        try {
            await new Promise<void>((resolve, reject) => {
                const socket = new net.Socket();
                socket.setTimeout(5000);
                socket.on('connect', () => { log('Port 587: Connected!'); socket.destroy(); resolve(); });
                socket.on('timeout', () => { socket.destroy(); reject(new Error('Timeout')); });
                socket.on('error', (err) => reject(err));
                socket.connect(587, 'smtp.gmail.com');
            });
        } catch (err) {
            log(`Port 587 Failed: ${(err as Error).message}`);
        }

        // 4. Nodemailer Verify
        log('Testing Nodemailer Transporter...');
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: env.EMAIL_USER,
                pass: env.EMAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Helps with some cloud proxy cert issues
            },
            connectionTimeout: 5000,
        } as nodemailer.TransportOptions);

        try {
            await transporter.verify();
            log('Nodemailer Verify Success! ✅');
        } catch (err) {
            log(`Nodemailer Verify Failed: ${(err as Error).message}`);
        }

        res.json({ message: 'Diagnostic Complete', logs });

    } catch (error) {
        log(`Unexpected Error: ${(error as Error).message}`);
        res.status(500).json({ message: 'Diagnostic Failed', logs });
    }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.grade = req.body.grade || user.grade;
            user.board = req.body.board || user.board;
            // Username update could be added here if desired, but usually requires uniqueness check

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
                role: updatedUser.role,
                grade: updatedUser.grade,
                board: updatedUser.board,
                xp: updatedUser.xp,
                badges: updatedUser.badges,
                token: generateToken((updatedUser._id as unknown) as string, updatedUser.role),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
