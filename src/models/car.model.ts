import { ICar } from '@/interface';
import { model, Schema } from 'mongoose';

const carSchema = new Schema<ICar>(
   {
      name: {
         type: String,
         required: [true, 'Name is required'],
         trim: true,
         unique: true,
      },
      desc: {
         type: String,
         required: [true, 'Description is required'],
         trim: true,
      },
      imageUrl: {
         type: String,
         required: [true, 'Image url is required'],
         trim: true,
      },
      brandId: {
         type: String,
         required: [true, 'Brand id is required'],
      },
      price: {
         type: Number,
         required: [true, 'Price is required'],
      },
      discount: Number,
      numSeats: {
         type: Number,
         default: 4,
      },
      power: {
         type: String,
         enum: ['petrol', 'electronic'],
         default: 'petrol',
      },
      steering: {
         type: String,
         enum: ['auto', 'manual'],
         default: 'manual',
      },
      usersLike: [String],
      avgReview: {
         type: Number,
         default: 0,
      },
      imgLibrary: {
         type: [String],
         required: [true, 'Image library is required'],
      },
   },
   {
      timestamps: true,
   }
);

const Car = model<ICar>('Car', carSchema);

export default Car;
