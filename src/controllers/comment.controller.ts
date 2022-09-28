import { IComment, IUser } from '@/interface';
import { Comment } from '@/models';
import { IRequest, TypedRequestBody } from '@/types';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

class CommentController {
   public getAllComments = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { postId } = req.params;

         const comments = await Comment.aggregate([
            {
               $match: {
                  postId: new mongoose.Types.ObjectId(postId),
                  parentId: null,
               },
            },
            {
               $lookup: {
                  as: 'user',
                  from: 'users',
                  localField: 'authorId',
                  foreignField: '_id',
               },
            },
            {
               $lookup: {
                  from: 'comments',
                  localField: '_id',
                  foreignField: 'parentId',
                  as: 'children',
               },
            },
            {
               $unwind: {
                  path: '$user',
                  preserveNullAndEmptyArrays: true,
               },
            },
            {
               $addFields: {
                  numChildren: {
                     $size: '$children',
                  },
               },
            },
            {
               $unset: [
                  'user.password',
                  'user.refreshToken',
                  'user.passwordResetToken',
                  'authorId',
                  'children',
               ],
            },
         ]);

         res.status(200).json({
            message: 'success',
            data: {
               comments,
            },
         });
      }
   );

   public addComment = catchAsync(
      async (
         req: TypedRequestBody<Pick<IComment, 'content' | 'parentId'>> & {
            user: IUser;
         },
         res: Response,
         next: NextFunction
      ) => {
         const { postId } = req.params;

         const comment = await Comment.create({
            postId,
            authorId: req.user._id,
            content: req.body.content,
            parentId: req.body.parentId,
         });

         res.status(200).json({
            message: 'success',
            data: {
               comment: {
                  ...comment.toObject(),
                  user: {
                     ...req.user.toObject(),
                  },
                  authorId: undefined,
               },
            },
         });
      }
   );

   public removeComment = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { postId, commentId } = req.params;

         const comment = await Comment.findOneAndDelete({
            postId,
            _id: commentId,
         });

         if (!comment) {
            return next(new AppError('No comment with this ID', 404));
         }

         await Comment.deleteMany({
            postId,
            parentId: commentId,
         });

         res.status(200).json({
            message: 'success',
            data: null,
         });
      }
   );

   public getChildComments = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { postId } = req.params;
         const { parentId } = req.query;
         const limit = Number(req.query.limit) || 5;
         const page = Number(req.query.page) || 1;
         const comments = await Comment.aggregate([
            {
               $match: {
                  postId: new mongoose.Types.ObjectId(postId),
                  parentId: new mongoose.Types.ObjectId(parentId as string),
               },
            },
            {
               $lookup: {
                  as: 'user',
                  from: 'users',
                  localField: 'authorId',
                  foreignField: '_id',
               },
            },
            {
               $unwind: {
                  path: '$user',
                  preserveNullAndEmptyArrays: true,
               },
            },
            {
               $unset: [
                  'user.password',
                  'user.refreshToken',
                  'user.passwordResetToken',
                  'authorId',
               ],
            },
         ])
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('-createdAt');

         res.status(200).json({
            message: 'Success',
            data: {
               comments,
            },
         });
      }
   );

   public likeComment = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { commentId, postId } = req.params;
         const comment = await Comment.findByIdAndUpdate(
            {
               _id: commentId,
               postId,
            },
            { $push: { usersLiked: req.user._id } },
            {
               new: true,
            }
         );

         if (!comment) {
            return next(new AppError('No comment with this ID', 404));
         }

         return res.status(200).json({
            message: 'success',
            data: {
               comment,
            },
         });
      }
   );
   public unlikeComment = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { commentId, postId } = req.params;
         const comment = await Comment.findByIdAndUpdate(
            {
               _id: commentId,
               postId,
            },
            { $pull: { usersLiked: req.user._id } },
            {
               new: true,
            }
         );

         if (!comment) {
            return next(new AppError('No comment with this ID', 404));
         }

         return res.status(200).json({
            message: 'success',
            data: {
               comment,
            },
         });
      }
   );
}

export default new CommentController();
