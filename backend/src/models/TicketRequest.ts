// models/TicketRequest.ts
import mongoose, { Document, Schema } from 'mongoose';
import { ITicketRequest } from '../Types/ITicketRequest';

const ticketRequestSchema = new Schema<ITicketRequest>(
  {
    seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['train', 'bus', 'flight'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    travelDate: { type: Date, required: true },
    timeRange: { type: String },
    additionalNotes: { type: String },
    status: { type: String, enum: ['open', 'accepted', 'fulfilled', 'cancelled'], default: 'open' },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
    fulfilledAt: { type: Date },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    maxBudget: { type: Number },
    contactPreference: { type: String, enum: ['call', 'sms', 'email'], default: 'sms' },
    isDeleted: { type: Boolean, default: false },
    meta: { type: Schema.Types.Mixed }
  },
  { timestamps: true }
);

export default mongoose.model<ITicketRequest>('TicketRequest', ticketRequestSchema);
