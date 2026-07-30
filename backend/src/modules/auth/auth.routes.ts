import express from 'express';
import { register, login, getMe, updateProfile, sendSignupOtp, verifySignupOtp, testEmailConnection } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.get('/test-email-connection', testEmailConnection);
router.post('/send-signup-otp', sendSignupOtp);
router.post('/verify-signup-otp', verifySignupOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

export default router;
