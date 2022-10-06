import { AppError, logger } from '@/utils';
import { NextFunction, Request, Response } from 'express';

type Error = AppError & {
   code: number;
};

const handleDuplicateError = (err: Error) => {
   return {
      message: 'This already have existed.',
      status: 409,
   };
};

const errorMiddleware = (
   err: Error,
   req: Request,
   res: Response,
   next: NextFunction
) => {
   let status = err.statusCode || 500;
   let message = err.message || 'Something went wrong';
   logger.error(err);

   if (err?.code === 11000) {
      const res = handleDuplicateError(err);
      status = res.status;
      message = res.message;
   }

   res.status(status).send({
      status,
      message,
   });
};

export default errorMiddleware;
