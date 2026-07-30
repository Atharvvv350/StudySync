import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
    {
        email: { type: String, required: true, unique: true },
        otp: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto-delete after 10 mins
    },
    { timestamps: true }
);

export const Otp = mongoose.model<IOtp>('Otp', OtpSchema);
