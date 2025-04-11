import mongoose, { Schema, Document } from 'mongoose';

export interface ISeeker extends Document {
    user: mongoose.Types.ObjectId;
    preferences?: string[];
    travelFrequency?: 'rare' | 'occasional' | 'frequent';
    profileBio?: string;
    preferredContactTime?: string;
    language?: string;
    walletBalance?: number;
    lastActiveAt?: Date;
    location?: {
        city?: string;
        country?: string;
    };
    isProfileComplete?: boolean;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const seekerSchema = new Schema<ISeeker>(
    {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
        preferences: [{ type: String }],
        travelFrequency: { type: String, enum: ['rare', 'occasional', 'frequent'], default: 'occasional' },
        profileBio: { type: String },
        preferredContactTime: { type: String },
        language: { type: String, default: 'en' },
        walletBalance: { type: Number, default: 0 },
        lastActiveAt: { type: Date },
        location: {
            city: { type: String },
            country: { type: String }
        },
        isProfileComplete: { type: Boolean, default: false },
        tags: [{ type: String }]
    },
    { timestamps: true }
);

export default mongoose.model<ISeeker>('Seeker', seekerSchema);
