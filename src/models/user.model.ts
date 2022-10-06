import { IUser } from '@/interface';
import bcrypt from 'bcrypt';
import mongoose, { Schema } from 'mongoose';
import validator from 'validator';

const userSchema = new mongoose.Schema<IUser>(
   {
      avatar: {
         type: String,
         default: '/noavatar.png',
      },
      bio: {
         type: String,
         default: '',
      },
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
      username: {
         type: String,
         required: [true, 'Username is required'],
         trim: true,
         unique: true,
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
      refreshToken: {
         type: String,
         default: undefined,
         select: false,
      },
      tokenResetPassword: {
         type: String,
         default: undefined,
         select: false,
      },
      followers: [
         {
            type: Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      following: [
         {
            type: Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
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

// userSchema.pre(/^find/, function (next) {
//    this.find();
// });

const User = mongoose.model<IUser>('User', userSchema);

export default User;
