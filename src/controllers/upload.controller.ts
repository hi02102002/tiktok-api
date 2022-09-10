import { catchAsync } from '@/utils';
import cloudinaryUploads from '@/utils/cloudinary';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';

class UploadController {
   public upload = catchAsync(
      async (req: Request, res: Response, next: NextFunction) => {
         const uploader = async (path: string) =>
            await cloudinaryUploads(path, 'Images');
         const urls: Array<{ url: string; id: string }> = [];
         const files = req.files;
         if (files) {
            //@ts-ignore
            for (const file of files) {
               const { path } = file;
               const newPath = await uploader(path);
               urls.push(newPath);
               fs.unlinkSync(path);
            }
         }
         res.status(200).json({
            message: 'success',
            data: {
               urls,
            },
         });
      }
   );
}

export default new UploadController();
