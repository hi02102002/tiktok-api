import { Role } from '@/types';
import { Document } from 'mongoose';

export interface IUser extends Document {
   firstName: string;
   lastName: string;
   email: string;
   password: string;
   createdAt: string;
   updatedAt: string;
   confirmPassword?: string;
   role: Role;
   comparePassword(
      candidatePassword: string,
      passwordHashed: string
   ): Promise<boolean>;
   refreshToken: string | null;
}
