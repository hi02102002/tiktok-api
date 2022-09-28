import { IPost } from '@/interface';
import { model, Schema } from 'mongoose';

const postSchema = new Schema<IPost>(
   {
      caption: {
         type: String,
         required: [true, 'Caption is required'],
         trim: true,
      },
      userId: {
         type: Schema.Types.ObjectId,
         ref: 'User',
         required: [true, 'User is required'],
      },
      video: {
         id: String,
         url: String,
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
      width: {
         type: Number,
         required: true,
      },
      height: {
         type: Number,
         required: true,
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
