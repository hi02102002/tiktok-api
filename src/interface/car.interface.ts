import { Document } from 'mongoose';

export interface ICar extends Document {
   name: string;
   imageUrl: string;
   brandId: string;
   desc: string;
   price: number;
   discount?: number;
   numSeats?: number;
   power?: 'petrol' | 'electronic';
   steering?: 'auto' | 'manual';
   usersLike?: Array<string>;
   avgReview?: number;
   imgLibrary?: Array<string>;
   createdAt?: string;
   updatedAt?: string;
}
