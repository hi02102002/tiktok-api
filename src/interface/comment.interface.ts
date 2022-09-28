import { Schema } from 'mongoose';

export interface IComment extends Document {
   authorId: Schema.Types.ObjectId;
   postId: Schema.Types.ObjectId;
   content: string;
   parentId: Schema.Types.ObjectId | null;
   usersLiked: Array<string>;
}
