import { User } from '@/models';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const verifyToken = catchAsync(
   async (
      req: Request & {
         headers: {
            authorization: string;
         };
      },
      res: Response,
      next: NextFunction
   ) => {
      let token: string | undefined = undefined;

      if (
         req.headers.authorization &&
         req.headers.authorization.startsWith('Bearer')
      ) {
         token = req.headers.authorization.split(' ')[1];
      }

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

      const user = await User.findById(id);

      if (!user) {
         return next(
            new AppError(
               'The user belonging to this token does no longer exist',
               401
            )
         );
      }

      //@ts-ignore
      req.user = user;
      next();
   }
);

export default verifyToken;
