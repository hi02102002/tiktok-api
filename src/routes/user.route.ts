import { UserController } from '@/controllers';
import { verifyToken } from '@/middlewares';
import { Router } from 'express';

const router = Router();

router.route('/search').get(UserController.searchUsers);
router.get('/suggestAccounts', UserController.getSuggestAccounts);
router.get(
   '/followingAccounts',
   verifyToken,
   UserController.getFollowingAccounts
);
router
   .route('/:id')
   .get(UserController.getUser)
   .patch(verifyToken, UserController.updateUser);

router.patch('/follow/:userId', verifyToken, UserController.followingUser);
router.patch('/unfollow/:userId', verifyToken, UserController.unfollowingUser);

export default router;
