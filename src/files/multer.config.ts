import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterModuleOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const folderPath = req.body.folderPath; // Assuming folderPath is sent in the form data
      if (!folderPath) {
        return cb(new Error('Folder path is required'), '');
      }
      console.log('Destination folder path:', folderPath); // Log the destination folder path
      cb(null, folderPath);
    },
    
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      const filename = file.fieldname + '-' + uniqueSuffix + extension;
      console.log('File will be saved as:', filename); // Log the file name
      cb(null, filename);
    },
  }),
};
