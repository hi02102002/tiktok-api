import { IPost } from '@/interface';
import { model, Schema } from 'mongoose';

const postSchema = new Schema<IPost>(
   {
      content: {
         type: String,
         required: [true, 'Content is required'],
         trim: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: [true, 'User is required'],
      },
      videoUrl: {
         type: String,
         required: [true, 'Video url is required'],
         trim: true,
      },
      usersLiked: [
         {
            type: Schema.Types.ObjectId,
            ref: 'User',
         },
      ],
      type: {
         type: String,
         enum: ['PUBLIC', 'PRIVATE'],
         default: 'PUBLIC',
      },
      allowComment: {
         type: Boolean,
         default: true,
      },
   },
   {
      timestamps: true,
      toObject: {
         transform: true,
      },
   }
);

export default model<IPost>('Post', postSchema);
