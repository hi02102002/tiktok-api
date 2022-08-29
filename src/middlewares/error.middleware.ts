import { AppError } from '@/utils';
import { NextFunction, Request, Response } from 'express';

const errorMiddleware = (
   err: AppError & {
      code: number;
   },
   req: Request,
   res: Response,
   next: NextFunction
) => {
   const status = err.statusCode || 500;
   const message = err.message || 'Something went wrong';

   res.status(status).send({
      status,
      message,
   });
};

export default errorMiddleware;
