import mongoose from "mongoose";

export interface ITicketRequest extends Document {
    seekerId: mongoose.Types.ObjectId;
    mode: 'train' | 'bus' | 'flight';
    from: string;
    to: string;
    travelDate: Date;
    timeRange?: string;
    additionalNotes?: string;
    status: 'open' | 'accepted' | 'fulfilled' | 'cancelled';
    acceptedAt?: Date;
    fulfilledAt?: Date;
    acceptedBy?: mongoose.Types.ObjectId;
    priority?: 'low' | 'medium' | 'high';
    maxBudget?: number;
    contactPreference: 'call' | 'sms' | 'email';
    isDeleted: boolean;
    meta?: any;
    createdAt: Date;
    updatedAt: Date;
}