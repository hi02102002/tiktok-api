import { IPost, IUser } from '@/interface';
import { Post } from '@/models';
import { IRequest, TypedRequestBody } from '@/types';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';

const lookupUser = {
   $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
   },
};

const unwindUser = {
   $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true,
   },
};

const lookupPost = {
   $lookup: {
      from: 'posts',
      localField: 'user._id',
      foreignField: 'userId',
      as: 'posts',
   },
};

const unwindPost = {
   $unwind: {
      path: '$posts',
      preserveNullAndEmptyArrays: true,
   },
};

const lookupComment = {
   $lookup: {
      from: 'comments',
      localField: '_id',
      foreignField: 'postId',
      as: 'comments',
   },
};

const groupSumLike = {
   $group: {
      _id: '$_id',
      numLike: {
         $sum: {
            $size: '$posts.usersLiked',
         },
      },
      first: { $first: '$$ROOT' },
   },
};

const replaceRoot = {
   $replaceRoot: {
      newRoot: {
         $mergeObjects: ['$first', { numLike: '$numLike' }],
      },
   },
};

const addFields = {
   $addFields: {
      'user.numLike': '$numLike',
      totalComment: {
         $size: '$comments',
      },
   },
};

const unsetFields = {
   $unset: [
      'userId',
      'user.password',
      'user.refreshToken',
      'user.passwordRefreshToken',
      'numLike',
      'posts',
      'comments',
   ],
};

class PostController {
   public createPost = catchAsync(
      async (
         req: TypedRequestBody<IPost> & {
            user: IUser;
         },
         res: Response,
         next: NextFunction
      ) => {
         const post = await Post.create({
            ...req.body,
            userId: req.user._id,
         });
         res.status(200).json({
            message: 'success',
            data: {
               post: {
                  ...post.toObject(),
                  user: req.user,
                  userId: undefined,
               },
            },
         });
      }
   );
   public editPost = catchAsync(
      async (
         req: TypedRequestBody<IPost> & {
            user: IUser;
         },
         res: Response,
         next: NextFunction
      ) => {
         const { id } = req.params;
         const post = await Post.findByIdAndUpdate(
            id,
            { ...req.body },
            {
               new: true,
               runValidators: true,
            }
         );
         if (!post) {
            return next(new AppError('No post found with this ID', 404));
         }
         res.status(200).json({
            message: 'success',
            data: {
               post: {
                  ...post,
                  user: req.user,
                  userId: undefined,
               },
            },
         });
      }
   );
   public deletePost = catchAsync(
      async (
         req: TypedRequestBody<IPost>,
         res: Response,
         next: NextFunction
      ) => {
         const { id } = req.params;
         const post = await Post.findByIdAndDelete(id);
         if (!post) {
            return next(new AppError('No post found with this ID', 404));
         }
         res.status(200).json({
            message: 'success',
            data: {
               post: null,
            },
         });
      }
   );

   public getOnePost = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const { id } = req.params;

         const posts = await Post.aggregate<IPost>([
            {
               $match: {
                  _id: new mongoose.Types.ObjectId(id),
               },
            },
            lookupUser,
            unwindUser,
            lookupPost,
            unwindPost,
            lookupComment,
            groupSumLike,
            replaceRoot,
            addFields,
            unsetFields,
         ]);

         if (!posts[0]) {
            return next(new AppError('No post found with this ID', 404));
         }

         res.status(200).json({
            message: 'success',
            data: {
               post: posts[0],
            },
         });
      }
   );

   public like = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { postId } = req.params;
         const post = await Post.findByIdAndUpdate(
            {
               _id: postId,
            },
            { $push: { usersLiked: req.user._id } },
            {
               new: true,
            }
         );

         return res.status(200).json({
            message: 'success',
            data: {
               post,
            },
         });
      }
   );
   public unlike = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const { postId } = req.params;
         const post = await Post.findByIdAndUpdate(
            {
               _id: postId,
            },
            { $pull: { usersLiked: req.user._id } },
            {
               new: true,
            }
         );

         return res.status(200).json({
            message: 'success',
            data: {
               post,
            },
         });
      }
   );
   // aggregate comments
   // get all post to home page
   public getAllPost = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const posts = await Post.aggregate([
            {
               $match: {
                  type: 'PUBLIC',
               },
            },
            lookupUser,
            unwindUser,
            lookupPost,
            unwindPost,
            lookupComment,
            groupSumLike,
            replaceRoot,
            addFields,
            unsetFields,
         ])
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('-createdAt');
         res.status(200).json({
            message: 'success',
            data: {
               posts,
            },
         });
      }
   );

   // get post current user following
   public getAllFollowingPost = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const posts = await Post.aggregate([
            {
               $match: {
                  type: 'PUBLIC',
                  userId: {
                     $in: req.user.following,
                  },
               },
            },
            lookupUser,
            unwindUser,
            lookupPost,
            unwindPost,

            groupSumLike,
            replaceRoot,
            addFields,
            unsetFields,
         ])
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('-createdAt');
         res.status(200).json({
            message: 'success',
            data: {
               posts,
            },
         });
      }
   );

   // get posts user upload public
   public getAllPostByUserId = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const { userId } = req.params;
         const posts = await Post.aggregate([
            {
               $match: {
                  type: 'PUBLIC',
                  userId: new mongoose.Types.ObjectId(userId),
               },
            },
            lookupUser,
            unwindUser,
            lookupPost,
            unwindPost,
            groupSumLike,
            replaceRoot,
            addFields,
            unsetFields,
         ])
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('-createdAt');
         res.status(200).json({
            message: 'success',
            data: {
               posts,
            },
         });
      }
   );

   // get posts yourself upload
   public getAllOwnPost = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const posts = await Post.aggregate([
            {
               $match: {
                  userId: new mongoose.Types.ObjectId(req.user._id),
               },
            },
            lookupUser,
            unwindUser,
            lookupPost,
            unwindPost,
            groupSumLike,
            replaceRoot,
            addFields,
            unsetFields,
         ])
            .skip((page - 1) * limit)
            .limit(limit)
            .sort('-createdAt');
         res.status(200).json({
            message: 'success',
            data: {
               posts,
            },
         });
      }
   );
}

export default new PostController();
