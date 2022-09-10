import { User } from '@/models';
import { AppError, catchAsync, createToken } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import lodash from 'lodash';
import { createTransport } from 'nodemailer';
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
            return next(
               new AppError("Don't have account with this email.", 404)
            );
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
                  'tokenResetPassword',
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
            return next(new AppError('User with this token not exist', 404));
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

   public sendEmailResetPassword = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { email } = req.body;

         if (!email) {
            return next(new AppError('Please provide your email!', 400));
         }

         const user = await User.findOne({ email });

         if (!user) {
            return next(
               new AppError(
                  "Can't find user with this email. Please check your email again!",
                  404
               )
            );
         }

         const token = createToken(
            email,
            process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string,
            process.env.JWT_EXPIRES_RESET_PASSWORD_TOKEN as string
         );

         await user.updateOne({
            tokenResetPassword: token,
         });

         const transporter = createTransport({
            //@ts-ignore
            host: 'smtp.zoho.com',
            port: process.env.PORT_EMAIL as string,
            secure: 465,
            auth: {
               user: process.env.USER_EMAIL as string,
               pass: process.env.USER_EMAIL_PASSWORD as string,
            },
         });

         const url = `${req.protocol}://localhost:3000/reset-password?token=${token}`;

         transporter.sendMail(
            {
               from: `"Hoang Huy 👻" <${process.env.USER_EMAIL}>`, // sender address
               to: email,
               subject: 'Hello ✔',
               text: url,
            },
            (err) => {
               if (err) {
                  return next(
                     new AppError('Something went wrong while send email.', 500)
                  );
               } else {
                  res.status(200).json({
                     message:
                        'Sent message successfully. Please check your email.',
                  });
               }
            }
         );
      }
   );

   public resetPassword = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { token } = req.query;
         const { password } = req.body;

         if (!token || !password) {
            return next(new AppError('Please provider token or password', 400));
         }

         jwt.verify(
            token as string,
            process.env.JWT_SECRET_RESET_PASSWORD_TOKEN as string,
            async function (err) {
               if (err) {
                  return next(
                     new AppError('Incorrect token or it is expired', 401)
                  );
               }
               const user = await User.findOne({
                  tokenResetPassword: token,
               });

               if (!user) {
                  return next(
                     new AppError('User with this token not exist', 404)
                  );
               }

               user.password = password;
               user.tokenResetPassword = undefined;
               await user.save({ validateBeforeSave: false });
               res.status(200).send({
                  message: 'Change password successfully',
               });
            }
         );
      }
   );
}

export default new AuthController();
