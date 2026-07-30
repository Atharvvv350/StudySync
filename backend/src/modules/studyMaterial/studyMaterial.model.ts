import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyMaterial extends Document {
    title: string;
    description: string;
    content?: string;
    type: 'pdf' | 'youtube' | 'link' | 'topic';
    url?: string;
    pdfs?: { title: string; url: string }[];
    videos?: { title: string; url: string }[];
    board: string;
    grade: string;
    subject: string;
    chapter: string;
    topic: string;
    tags: string[];
    views: number;
    uploadedBy: mongoose.Schema.Types.ObjectId;
}

const StudyMaterialSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        content: { type: String }, // Rich text HTML content
        type: { type: String, enum: ['pdf', 'youtube', 'link', 'topic'], default: 'topic' },
        url: { type: String }, // Kept for backward compatibility
        pdfs: [{
            title: { type: String },
            url: { type: String }
        }],
        videos: [{
            title: { type: String },
            url: { type: String }
        }],
        board: { type: String, required: true },
        grade: { type: String, required: true },
        subject: { type: String, required: true },
        chapter: { type: String, required: true },
        topic: { type: String, required: false },
        tags: [{ type: String }],
        views: { type: Number, default: 0 },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

// Add indexes for efficient filtering and searching
StudyMaterialSchema.index({ board: 1, grade: 1, subject: 1, chapter: 1, topic: 1 });
StudyMaterialSchema.index({ title: 'text', description: 'text' });

export const StudyMaterial = mongoose.model<IStudyMaterial>('StudyMaterial', StudyMaterialSchema);
