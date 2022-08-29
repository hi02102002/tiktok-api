import { AuthController } from '@/controllers';
import { Router } from 'express';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refreshToken', AuthController.refreshToken);

export default router;
