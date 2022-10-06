import { IVideoUrl } from '@/types';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config({
   path: './config.env',
});

cloudinary.config({
   cloud_name: 'drahsrtec',
   api_key: `${process.env.API_KEY_CLOUDINARY}`,
   api_secret: `${process.env.API_KEY_SECRET_CLOUDINARY}`,
});

const cloudinaryUploads = async (
   file: string,
   folder: string
): Promise<IVideoUrl> => {
   return await cloudinary.uploader
      .upload(file, {
         folder,
         resource_type: 'auto',
      })
      .then((result) => {
         console.log(result);
         return {
            url: result.url,
            id: result.public_id,
         };
      });
};

export default cloudinaryUploads;
