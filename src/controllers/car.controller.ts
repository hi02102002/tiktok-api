import { Car } from '@/models';
import { AppError, catchAsync } from '@/utils';
import { NextFunction, Request, Response } from 'express';

class CarController {
   public getAllCars = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const cars = await Car.find();
         res.status(200).json({
            status: 'success',
            results: cars.length,
            data: {
               cars,
            },
         });
      }
   );
   public getCar = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const car = await Car.findById(req.params.id);
         if (!car) {
            return next(new AppError('No car found with that ID', 404));
         }
         res.status(200).json({
            status: 'success',
            data: {
               car,
            },
         });
      }
   );
   public createCar = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const newCar = await Car.create(req.body);
         res.status(201).json({
            status: 'success',
            data: {
               newCar,
            },
         });
      }
   );
   public updateCar = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const id = req.params.id;

         let car = await Car.findOneAndUpdate({ _id: id }, req.body, {
            new: true,
         });

         if (!car) {
            return next(new AppError('No car found with that ID.', 404));
         }

         res.status(200).json({
            status: 'success',
            data: {
               car,
            },
         });
      }
   );
   public removeCar = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const id = req.params.id;

         const car = await Car.findById(id);

         if (!car) {
            return next(new AppError('No car found with that ID.', 404));
         }

         await car.remove();

         res.status(200).json({
            message: 'success',
            data: null,
         });
      }
   );
}

export default new CarController();
