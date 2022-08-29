import { CarController } from '@/controllers';
import { roleMiddleware, verifyToken } from '@/middlewares';
import { RequestHandler, Router } from 'express';

const router = Router();

router
   .route('/')
   .get(CarController.getAllCars)
   .post(
      verifyToken,
      roleMiddleware('admin') as RequestHandler,
      CarController.createCar
   );

router
   .route('/:id')
   .get(CarController.getCar)
   .patch(
      verifyToken,
      roleMiddleware('admin') as RequestHandler,
      CarController.updateCar
   )
   .delete(
      verifyToken,
      roleMiddleware('admin') as RequestHandler,
      CarController.removeCar
   );

export default router;
