import { IUser } from '@/interface';
import { Request } from 'express';

export enum Role {
   USER = 'user',
   ADMIN = 'admin',
}

export interface IVideoUrl {
   url: string;
   id: string;
}

export interface IRequest extends Request {
   user: IUser;
}

export interface TypedRequestBody<T> extends Request {
   body: T;
}
