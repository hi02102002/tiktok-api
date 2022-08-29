import { IUser } from '@/interface';
import { Role } from '@/types';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema<IUser>(
   {
      firstName: {
         type: String,
         required: true,
         trim: true,
      },
      lastName: {
         type: String,
         required: [true, 'Last name is required'],
         trim: true,
      },
      email: {
         type: String,
         required: [true, 'Email is required'],
         trim: true,
         unique: true,
         validate: [validator.isEmail, 'Invalid Email'],
      },
      password: {
         type: String,
         required: [true, 'Password is required'],
         minlength: [8, 'Password at least 8 letter'],
         select: false,
      },
      confirmPassword: {
         type: String,
         required: [true, 'Confirm password is required'],
         validate: {
            validator: function (el: string): boolean {
               //@ts-ignore
               return el === this.password;
            },
            message: "Password don't match",
         },
      },
      role: {
         type: String,
         default: Role.USER,
         enum: Object.values(Role),
      },
      refreshToken: {
         type: String,
         default: null,
      },
   },
   {
      timestamps: true,
   }
);

userSchema.pre('save', async function (next) {
   if (!this.isModified('password')) return next();
   this.password = await bcrypt.hash(this.password, 10);
   this.confirmPassword = undefined;
   next();
});

userSchema.methods.comparePassword = async function (
   candidatePassword: string,
   passwordHashed: string
): Promise<boolean> {
   return await bcrypt.compare(candidatePassword, passwordHashed);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
