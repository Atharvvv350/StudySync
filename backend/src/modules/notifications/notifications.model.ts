import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Schema.Types.ObjectId;
    message: string;
    type: 'info' | 'alert' | 'success';
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['info', 'alert', 'success'], default: 'info' },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Add index for efficient fetching of user notifications
NotificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
