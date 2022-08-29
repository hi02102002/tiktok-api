import { IUser } from '@/interface';
import { AppError } from '@/utils';
import { NextFunction, Request, Response } from 'express';

interface IRequest extends Request {
   user: IUser;
}

export const roleMiddleware =
   (...roles: Array<string>) =>
   (req: IRequest, res: Response, next: NextFunction) => {
      if (roles.length && !roles.includes(req.user.role)) {
         return next(new AppError('Unauthorized', 401));
      }

      next();
   };
