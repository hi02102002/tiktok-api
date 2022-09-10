import { UploadController } from '@/controllers';
import { verifyToken } from '@/middlewares';
import upload from '@/utils/multer';
import { Router } from 'express';

const router = Router();

router
   .route('/upload')
   .post(verifyToken, upload.array('video'), UploadController.upload);

export default router;
