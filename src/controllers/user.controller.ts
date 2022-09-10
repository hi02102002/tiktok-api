import { IUser } from '@/interface';
import { User } from '@/models';
import { IRequest, TypedRequestBody } from '@/types';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';
class UserController {
   public getUser = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { id } = req.params;
         const user = await User.findById(id);
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

         let suggestAccounts: Array<IUser> = [];
         if (userId) {
            const user = await User.findById(userId); // lay ra user hien tai
            user?.following.push(userId); // exclude
            suggestAccounts = await User.find({
               _id: {
                  $nin: user?.following,
               },
            })
               .limit(20)
               .skip(0);
         } else {
            suggestAccounts = await User.find().limit(20).skip(0);
         }

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
         const followingAccounts = await User.find({
            _id: {
               $in: req.user.following,
            },
         })
            .limit(limit)
            .skip((page - 1) * limit);
         res.status(200).json({
            message: 'success',
            data: {
               followingAccounts,
            },
         });
      }
   );
}

export default new UserController();
