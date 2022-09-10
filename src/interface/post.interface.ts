import { IVideoUrl } from '@/types';
import { Document, Schema } from 'mongoose';

export interface IPost extends Document {
   userId: Schema.Types.ObjectId;
   content: string;
   videoUrl: IVideoUrl;
   usersLiked: Array<Schema.Types.ObjectId>;
   type: 'PUBLIC' | 'PRIVATE';
   allowComment: boolean;
}
