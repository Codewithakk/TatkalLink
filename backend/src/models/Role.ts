import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  permissions: string[];
}

const roleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
