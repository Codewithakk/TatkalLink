// models/Rating.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IRating extends Document {
  seekerId: mongoose.Types.ObjectId;
  providerId: mongoose.Types.ObjectId;
  rating: number;
  feedback?: string;
  createdAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    seekerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    feedback: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IRating>('Rating', ratingSchema);
