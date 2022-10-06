import { IVideoUrl } from '@/types';
import { Document, Schema } from 'mongoose';

export interface IPost extends Document {
   userId: Schema.Types.ObjectId;
   caption: string;
   video: IVideoUrl;
   usersLiked: Array<Schema.Types.ObjectId>;
   type: 'PUBLIC' | 'PRIVATE';
   allowComment: boolean;
   width: number;
   height: number;
   cover: IVideoUrl;
}
