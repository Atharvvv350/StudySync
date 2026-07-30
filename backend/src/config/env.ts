import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('5000'),
    MONGO_URI: z.string(),
    JWT_SECRET: z.string(),
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLIENT_URL: z.string().default('http://localhost:5173'),
    EMAIL_USER: z.string().optional(),
    EMAIL_PASS: z.string().optional(),
    EMAIL_HOST: z.string().default('smtp.gmail.com'),
    EMAIL_PORT: z.string().default('587'),
});

export const env = envSchema.parse(process.env);
