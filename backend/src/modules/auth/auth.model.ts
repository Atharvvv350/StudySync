import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    username?: string;
    email: string;
    password?: string;
    role: 'student' | 'admin';
    grade?: string;
    board?: string;
    subjects?: string[];
    xp: number;
    badges: string[];
    isVerified: boolean;
    otp?: string;
    otpExpires?: Date;
    createdAt: Date;
    comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        username: { type: String, unique: true, sparse: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['student', 'admin'], default: 'student' },
        grade: { type: String },
        board: { type: String },
        subjects: [{ type: String }],
        xp: { type: Number, default: 0 },
        badges: [{ type: String }],
        isVerified: { type: Boolean, default: false },
        otp: { type: String },
        otpExpires: { type: Date },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.methods.comparePassword = async function (password: string) {
    return await bcrypt.compare(password, this.password!);
};

export const User = mongoose.model<IUser>('User', UserSchema);
