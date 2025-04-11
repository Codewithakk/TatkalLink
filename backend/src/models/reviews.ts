// models/Review.ts or Review.js
import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    reviewer: {
        id: mongoose.Types.ObjectId;
        role: 'seeker' | 'provider';
    };
    recipient: {
        id: mongoose.Types.ObjectId;
        role: 'seeker' | 'provider';
    };
    rating: number;
    comment: string;
    ticketType: 'train' | 'bus' | 'flight' | 'other';
    responseText?: string;
    responseDate?: Date;
    relatedRequestId?: mongoose.Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const reviewSchema = new Schema<IReview>(
    {
        reviewer: {
            id: { type: Schema.Types.ObjectId, required: true, refPath: 'reviewer.role' },
            role: { type: String, enum: ['seeker', 'provider'], required: true },
        },
        recipient: {
            id: { type: Schema.Types.ObjectId, required: true, refPath: 'recipient.role' },
            role: { type: String, enum: ['seeker', 'provider'], required: true },
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        comment: {
            type: String,
            trim: true,
        },
        ticketType: {
            type: String,
            enum: ['train', 'bus', 'flight', 'other'],
            required: true,
        },
        relatedRequestId: {
            type: Schema.Types.ObjectId,
            ref: 'Request',
        },
        responseText: {
            type: String,
            trim: true,
        },
        responseDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IReview>('Review', reviewSchema);
