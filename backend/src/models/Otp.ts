import mongoose, { Document, Schema } from 'mongoose';

export interface IOTP extends Document {
  phoneOrEmail: string;
  otp: string;
  expiresAt: Date;
  verified: boolean;
}

const otpSchema = new Schema<IOTP>(
  {
    phoneOrEmail: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const OTP = mongoose.model<IOTP>('OTP', otpSchema);
