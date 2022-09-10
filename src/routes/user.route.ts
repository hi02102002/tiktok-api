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

export default router;
