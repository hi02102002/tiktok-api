import { IUser } from '@/interface';
import { User } from '@/models';
import { UserService } from '@/services';
import { IRequest, TypedRequestBody } from '@/types';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';

class UserController {
   public getUser = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { id } = req.params;
         const user = await UserService.getUser(id);

         if (!user) {
            return next(new AppError('No user found with this ID', 404));
         }
         res.status(200).json({
            message: 'success',
            data: {
               user,
            },
         });
      }
   );

   public updateUser = catchAsync(
      async (
         req: TypedRequestBody<IUser>,
         res: Response,
         next: NextFunction
      ) => {
         const { id } = req.params;
         const user = await User.findByIdAndUpdate(
            id,
            { ...req.body },
            {
               new: true,
               runValidators: true,
            }
         );
         if (!user) {
            return next(new AppError('No user found with this ID', 404));
         }
         res.status(200).json({
            message: 'success',
            data: {
               user,
            },
         });
      }
   );

   public searchUsers = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { q } = req.query;
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;

         const users = await User.find({
            $or: [
               {
                  firstName: {
                     $regex: q || '',
                     $options: 'i',
                  },
               },
               { lastName: { $regex: q || '', $options: 'i' } },
               { username: { $regex: q || '', $options: 'i' } },
            ],
         })
            .skip((page - 1) * limit)
            .limit(limit);

         res.status(200).json({
            message: 'success',
            data: {
               users,
            },
         });
      }
   );

   public getSuggestAccounts = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const userId = req.query.userId as string;

         const suggestAccounts: Array<IUser> =
            await UserService.getSuggestAccounts(userId);

         res.status(200).json({
            message: 'success',
            data: {
               suggestAccounts,
            },
         });
      }
   );

   public getFollowingAccounts = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const followingAccounts = await UserService.getFollowingAccounts(
            req.user,
            page,
            limit
         );
         res.status(200).json({
            message: 'success',
            data: {
               followingAccounts,
            },
         });
      }
   );

   public followingUser = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { userId } = req.params;

         const receiver = await User.findByIdAndUpdate(userId, {
            $push: {
               followers: req.user._id,
            },
         });

         if (!receiver) {
            return next(new AppError('No receiver with this ID', 404));
         }

         const user = await User.findByIdAndUpdate(
            req.user._id,
            {
               $push: {
                  following: userId,
               },
            },
            {
               new: true,
            }
         );

         res.status(200).json({
            message: 'success',
            data: {
               user,
            },
         });
      }
   );
   public unfollowingUser = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { userId } = req.params;

         const receiver = await User.findByIdAndUpdate(userId, {
            $pull: {
               followers: req.user._id,
            },
         });

         if (!receiver) {
            return next(new AppError('No receiver with this ID', 404));
         }

         const user = await User.findByIdAndUpdate(
            req.user._id,
            {
               $pull: {
                  following: userId,
               },
            },
            {
               new: true,
            }
         );

         res.status(200).json({
            message: 'success',
            data: {
               user,
            },
         });
      }
   );
}

export default new UserController();
