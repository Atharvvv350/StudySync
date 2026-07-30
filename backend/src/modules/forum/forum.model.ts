import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswer extends Document {
    text: string;
    answeredBy: mongoose.Schema.Types.ObjectId;
    upvotes: mongoose.Schema.Types.ObjectId[];
    isVerified: boolean;
    createdAt: Date;
    image?: string;
}

export interface IQuestion extends Document {
    title: string;
    description: string;
    askedBy: mongoose.Schema.Types.ObjectId;
    tags: string[];
    answers: IAnswer[];
    views: number;
    image?: string;
}

const AnswerSchema: Schema = new Schema(
    {
        text: { type: String, required: true },
        answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isVerified: { type: Boolean, default: false },
        image: { type: String },
    },
    { timestamps: true }
);

const QuestionSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        tags: [{ type: String }],
        answers: [AnswerSchema],
        views: { type: Number, default: 0 },
        image: { type: String },
    },
    { timestamps: true }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
