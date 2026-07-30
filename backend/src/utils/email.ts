import axios from 'axios';
import { env } from '../config/env';

export const sendEmail = async (to: string, subject: string, text: string) => {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) {
        console.warn('Email credentials not found. Skipping email sending.');
        return;
    }

    // Use Brevo HTTP API to bypass SMTP port blocking
    try {
        await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: { email: env.EMAIL_USER, name: 'StudySync' },
                to: [{ email: to }],
                subject: subject,
                textContent: text,
            },
            {
                headers: {
                    'api-key': env.EMAIL_PASS, // User must provide API Key here
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );
        console.log(`Email sent to ${to} via Brevo API`);
    } catch (error: any) {
        console.error('Error sending email via Brevo API:', error.response?.data || error.message);
        throw new Error('Email could not be sent');
    }
};
