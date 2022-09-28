import { CommentController, PostController } from '@/controllers';
import { verifyToken } from '@/middlewares';
import { Router } from 'express';

const router = Router();

router
   .route('/')
   .post(verifyToken, PostController.createPost)
   .get(PostController.getAllPost);
router
   .route('/:id')
   .post(verifyToken, PostController.editPost)
   .get(PostController.getOnePost)
   .delete(verifyToken, PostController.deletePost);

router.get('/following', verifyToken, PostController.getAllFollowingPost);
router.get('/user/:userId', PostController.getAllPostByUserId);
router.get('/me', verifyToken, PostController.getAllOwnPost);

router.patch('/:postId/like', verifyToken, PostController.like);
router.patch('/:postId/unlike', verifyToken, PostController.unlike);
router.get('/:postId/comments', CommentController.getAllComments);
router.get('/:postId/comments/children', CommentController.getChildComments);
router.post('/:postId/comments', verifyToken, CommentController.addComment);
router.delete(
   '/:postId/comments/:commentId',
   verifyToken,
   CommentController.removeComment
);
router.patch(
   '/:postId/comments/:commentId/like',
   verifyToken,
   CommentController.likeComment
);
router.patch(
   '/:postId/comments/:commentId/unlike',
   verifyToken,
   CommentController.unlikeComment
);

export default router;
