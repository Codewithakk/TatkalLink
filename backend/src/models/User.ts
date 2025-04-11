// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  userProfile?: string;
  phone: string;
  password: string;
  role: 'seeker' | 'provider' | 'admin';
  isVerified: boolean;
  tokens: { token: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    userProfile: { type: String, default: '' },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['seeker', 'provider', 'admin'], default: 'seeker' },
    isVerified: { type: Boolean, default: false },
    tokens: [{ token: { type: String } }],
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
