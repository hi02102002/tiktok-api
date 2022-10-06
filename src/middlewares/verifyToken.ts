import { IUser } from '@/interface';
import { User } from '@/models';
import { AppError, catchAsync, getTokenAuthorization } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

const verifyToken = catchAsync(
   async (
      req: Request & {
         headers: {
            authorization: string;
         };
         user: IUser;
      },
      res: Response,
      next: NextFunction
   ) => {
      const token = getTokenAuthorization(req.headers.authorization);

      if (!token) {
         return next(
            new AppError(
               'You are not logged in!. Please login in to get access',
               401
            )
         );
      }

      const { id } = jwt.verify(
         token,
         process.env.JWT_SECRET_ACCESS_TOKEN as string
      ) as JwtPayload;

      const user = await User.findById(new mongoose.Types.ObjectId(id));

      if (!user) {
         return next(
            new AppError(
               'The user belonging to this token does no longer exist',
               401
            )
         );
      }

      req.user = user;
      next();
   }
);

export default verifyToken;
