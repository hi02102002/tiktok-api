import { IComment } from '@/interface';
import { model, Schema } from 'mongoose';

const commentSchema = new Schema<IComment>(
   {
      postId: {
         type: Schema.Types.ObjectId,
         ref: 'Post',
      },
      parentId: {
         default: null,
         type: Schema.Types.ObjectId,
      },
      authorId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
      },
      content: {
         type: String,
         trim: true,
      },
      usersLiked: [
         {
            type: Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
   },
   {
      timestamps: true,
   }
);

export default model<IComment>('Comment', commentSchema);
