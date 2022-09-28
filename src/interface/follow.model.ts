import { Document } from 'mongoose';

export interface IFollow extends Document {
   userId: string;
   userIdFollow: string;
}
