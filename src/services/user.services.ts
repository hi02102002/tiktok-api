import { IUser } from '@/interface';
import { User } from '@/models';
import mongoose from 'mongoose';

const lookupPost = {
   $lookup: {
      from: 'posts',
      localField: '_id',
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

const groupSumLike = {
   $group: {
      _id: '$_id',
      numLike: {
         $sum: {
            $cond: [
               {
                  $eq: [{ $type: '$posts.usersLiked' }, 'missing'],
               },
               0,
               {
                  $size: '$posts.usersLiked',
               },
            ],
         },
      },
      first: { $first: '$$ROOT' },
   },
};

const unsetFields = {
   $unset: ['password', 'refreshToken', 'passwordRefreshToken', 'posts'],
};

const replaceRoot = {
   $replaceRoot: {
      newRoot: {
         $mergeObjects: ['$first', { numLike: '$numLike' }],
      },
   },
};

class UserService {
   public async getUser(userId: string) {
      const users = await User.aggregate<IUser>([
         {
            $match: {
               _id: new mongoose.Types.ObjectId(userId),
            },
         },
         lookupPost,
         unwindPost,
         groupSumLike,
         replaceRoot,
         unsetFields,
      ]);
      return users[0];
   }
   public async getSuggestAccounts(userId: string | undefined) {
      const user = await User.findById(userId); // lay ra user hien tai
      user?.following.push(userId as string); // exclude
      let suggestAccounts: Array<IUser> = [];

      if (userId) {
         suggestAccounts = await User.aggregate([
            {
               $match: {
                  _id: {
                     $nin: user?.following,
                  },
               },
            },
            lookupPost,
            unwindPost,
            groupSumLike,
            replaceRoot,
            unsetFields,
         ])
            .limit(20)
            .skip(0);
      } else {
         suggestAccounts = await User.aggregate([
            lookupPost,
            unwindPost,
            groupSumLike,
            replaceRoot,
            unsetFields,
         ])
            .limit(20)
            .skip(0);
      }

      return suggestAccounts;
   }

   public async getFollowingAccounts(user: IUser, page: number, limit: number) {
      const followingAccounts = await User.aggregate([
         {
            $match: {
               _id: {
                  $in: user.following,
               },
            },
         },
         lookupPost,
         unwindPost,
         groupSumLike,
         replaceRoot,
      ])
         .limit(limit)
         .skip((page - 1) * limit);
      return followingAccounts;
   }
}

export default new UserService();
