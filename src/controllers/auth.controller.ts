import { User } from '@/models';
import { AppError, catchAsync, createToken } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import lodash from 'lodash';

interface CallbackError extends NativeError {
   code: number;
}

class AuthController {
   public register = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const newUser = new User(req.body);

         //@ts-ignore
         newUser.save(function (error: CallbackError) {
            if (error) {
               if (error.name === 'MongoServerError' && error.code === 11000) {
                  return next(new AppError('User already exist!', 409));
               }
               return res.status(404).send(error);
            }
            return res.status(201).json({
               status: 'success',
               data: {
                  user: lodash.omit(newUser.toObject(), [
                     'password',
                     'refreshToken',
                  ]),
               },
            });
         });
      }
   );
   public login = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { email, password } = req.body;
         if (!email || !password) {
            return next(new AppError('You missed email or password', 400));
         }
         const user = await User.findOne({ email: req.body.email }).select(
            '+password'
         );

         if (!user) {
            return next(new AppError("This email isn't created", 404));
         }

         if (!(await user.comparePassword(password, user.password))) {
            return next(new AppError('Password incorrect', 401));
         }

         const accessToken = createToken(
            user.id,
            process.env.JWT_SECRET_ACCESS_TOKEN as string,
            process.env.JWT_EXPIRES_ACCESS_TOKEN as string
         );

         const refreshToken = createToken(
            user.id,
            process.env.JWT_SECRET_REFRESH_TOKEN as string,
            process.env.JWT_EXPIRES_REFRESH_TOKEN as string
         );

         await user.updateOne({ refreshToken });

         res.status(200).json({
            message: 'success',
            data: {
               user: lodash.omit(user.toObject(), [
                  'password',
                  'refreshToken',
                  '__v',
               ]),
               token: {
                  accessToken,
                  refreshToken,
               },
            },
         });
      }
   );

   public refreshToken = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { refreshToken: _refreshToken } = req.body;

         if (!_refreshToken) {
            return next(new AppError('No refresh token', 400));
         }

         const { id, exp } = jwt.decode(_refreshToken) as JwtPayload;

         const currentTimestamp = new Date().getTime() / 1000;

         if ((exp as number) < currentTimestamp) {
            return next(new AppError('Refresh token expired', 403));
         }

         const user = await User.findById(id);

         if (!user) {
            return next(new AppError("This token isn't token of user", 403));
         }

         jwt.verify(
            _refreshToken,
            process.env.JWT_SECRET_REFRESH_TOKEN as string
         );

         const accessToken = createToken(
            user.id,
            process.env.JWT_SECRET_ACCESS_TOKEN as string,
            process.env.JWT_EXPIRES_ACCESS_TOKEN as string
         );

         const refreshToken = createToken(
            user.id,
            process.env.JWT_SECRET_REFRESH_TOKEN as string,
            process.env.JWT_EXPIRES_REFRESH_TOKEN as string
         );

         await user.updateOne({ refreshToken });

         res.status(200).json({
            message: 'success',
            data: {
               token: {
                  accessToken,
                  refreshToken,
               },
            },
         });
      }
   );
}

export default new AuthController();
