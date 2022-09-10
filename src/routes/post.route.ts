import { PostController } from '@/controllers';
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
   .delete(verifyToken, PostController.deletePost);

router.get('/following', verifyToken, PostController.getAllFollowingPost);
router.get('/:userId', PostController.getAllPostByUserId);
router.get('/me', verifyToken, PostController.getAllOwnPost);

export default router;
