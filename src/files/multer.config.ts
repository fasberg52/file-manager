import { diskStorage } from 'multer';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerConfig = {
  storage: diskStorage({
    destination: (req: Request, file, cb) => {
      const folderPath: string = req.body.folderPath;
      console.log(`folderPath >>> ${folderPath}`);
      if (!folderPath) {
        return cb(new BadRequestException('Folder path is required'), '');
      }
      cb(null, folderPath);
    },
    
    filename: (req, file, cb) => {
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFilename);
    },
  }),
};
