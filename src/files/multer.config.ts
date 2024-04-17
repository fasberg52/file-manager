import { diskStorage } from 'multer';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export let uniqueFilename: string = ''; 

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
      const ext = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, ext);
      let uploadPath = path.join(req.body.folderPath, file.originalname);

      uniqueFilename = file.originalname;
      let counter = 1;
      while (fs.existsSync(uploadPath)) {
        uniqueFilename = `${baseName}-${counter}${ext}`;
        uploadPath = path.join(req.body.folderPath, uniqueFilename);
        counter++;
      }

      cb(null, uniqueFilename);
    },
  }),
};
