//multer/multer.config.ts

import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterModuleOptions = {
  dest: './root/root', // Set the destination folder where files will be stored
  storage: diskStorage({
    destination: (req, file, cb) => {
      const folderId = req.params.folderId; // Assuming you have a route parameter for folderId
      const folderPath = `./root/root/${folderId}`; // Dynamic folder path based on folderId
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
  }),
};
