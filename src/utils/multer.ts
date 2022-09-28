import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
   destination: function (req, file, cb) {
      cb(null, './tmp/my-uploads');
   },
   filename: function (req, file, cb) {
      cb(
         null,
         `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
   },
});

const upload = multer({
   storage: storage,
   limits: { fileSize: 10 * 1024 * 1024 },
   fileFilter: function (req, file, cb) {
      if (
         file.mimetype === 'image/jpeg' ||
         file.mimetype === 'image/png' ||
         file.mimetype === 'video/mp4'
      ) {
         cb(null, true);
      } else {
         //@ts-ignore
         cb({ message: 'Unsupported file format' }, false);
      }
   },
});

export default upload;
