// models/TicketRequest.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketRequest extends Document {
  seekerId: mongoose.Types.ObjectId;
  mode: 'train' | 'bus' | 'flight';
  from: string;
  to: string;
  travelDate: Date;
  timeRange: string;
  additionalNotes?: string;
  status: 'open' | 'accepted' | 'fulfilled' | 'cancelled';
  acceptedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ticketRequestSchema = new Schema<ITicketRequest>(
  {
    seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['train', 'bus', 'flight'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    travelDate: { type: Date, required: true },
    timeRange: { type: String }, // e.g., "morning", "evening", etc.
    additionalNotes: { type: String },
    status: { type: String, enum: ['open', 'accepted', 'fulfilled', 'cancelled'], default: 'open' },
    acceptedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ITicketRequest>('TicketRequest', ticketRequestSchema);
