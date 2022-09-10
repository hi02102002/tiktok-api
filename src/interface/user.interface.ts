import { Document } from 'mongoose';

export interface IUser extends Document {
   firstName: string;
   lastName: string;
   username: string;
   avatar: string;
   bio: string;
   email: string;
   password: string;
   confirmPassword?: string;
   refreshToken: string | undefined;
   tokenResetPassword: string | undefined;
   following: Array<string>;
   followers: Array<string>;
   comparePassword(
      candidatePassword: string,
      passwordHashed: string
   ): Promise<boolean>;
}
