export interface IComment extends Document {
   userId: string;
   postId: string;
   content: string;
}

export interface INestedComment extends IComment {
   parentId: string;
}
