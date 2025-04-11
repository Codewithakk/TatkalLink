import { Document } from 'mongoose';

export interface ISeeker extends Document {
    name: string;
    email: string;
    phone: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}
