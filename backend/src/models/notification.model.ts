import mongoose, { Schema, model, Document } from 'mongoose';

interface NotificationDocument extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Notification = model<NotificationDocument>('Notification', NotificationSchema);
