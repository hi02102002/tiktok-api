import { IPost } from '@/interface';
import { Post } from '@/models';
import { IRequest, TypedRequestBody } from '@/types';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Response } from 'express';
class PostController {
   public createPost = catchAsync(
      async (
         req: TypedRequestBody<IPost>,
         res: Response,
         next: NextFunction
      ) => {
         const post = await Post.create({
            ...req.body,
         });
         res.status(200).json({
            message: 'success',
            data: {
               post,
            },
         });
      }
   );
   public editPost = catchAsync(
      async (
         req: TypedRequestBody<IPost>,
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
               post,
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
   // aggregate comments
   // get all post to home page
   public getAllPost = catchAsync(
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const posts = await Post.find()
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
         const posts = await Post.find()
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
      async (req: IRequest, res: Response, next: NextFunction) => {
         const limit = Number(req.query.limit) || 10;
         const page = Number(req.query.page) || 1;
         const posts = await Post.find()
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
         const posts = await Post.find()
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
