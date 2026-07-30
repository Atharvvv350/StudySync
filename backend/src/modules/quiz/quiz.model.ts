import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
    questionText: string;
    options: string[];
    correctOption: number; // Index 0-3
    explanation?: string;
}

export interface IQuiz extends Document {
    title: string;
    description: string;
    board: string;
    grade: string;
    subject: string;
    chapter: string;
    topic: string;
    duration: number;
    maxAttempts?: number;
    questions: IQuestion[];
    createdBy: mongoose.Schema.Types.ObjectId;
}

const QuizSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        board: { type: String, required: true },
        grade: { type: String, required: true },
        subject: { type: String, required: true },
        chapter: { type: String, required: true },
        topic: { type: String, required: true },
        duration: { type: Number, default: 20 },
        maxAttempts: { type: Number, default: null }, // null means unlimited
        questions: [
            {
                questionText: { type: String, required: true },
                options: [{ type: String, required: true }],
                correctOption: { type: Number, required: true },
                explanation: { type: String },
            },
        ],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Add indexes for efficient filtering
QuizSchema.index({ board: 1, grade: 1, subject: 1, chapter: 1, topic: 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);

// Quiz Attempt Model
export interface IQuizAttempt extends Document {
    student: mongoose.Schema.Types.ObjectId;
    quiz: mongoose.Schema.Types.ObjectId;
    score: number;
    totalQuestions: number;
    answers: { questionId: string; selectedOption: number; isCorrect: boolean }[];
    completedAt: Date;
}

const QuizAttemptSchema: Schema = new Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
        score: { type: Number, required: true },
        totalQuestions: { type: Number, required: true },
        answers: [
            {
                questionId: { type: String },
                selectedOption: { type: Number },
                isCorrect: { type: Boolean },
            },
        ],
        completedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
