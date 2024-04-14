import { MulterModuleOptions } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig: MulterModuleOptions = {
  dest: './root/root', // Set the destination folder where files will be stored
  storage: diskStorage({
    destination: (req, file, cb) => {
      const folderName = req.params.folderName; // Assuming you have a route parameter for folderName
      const folderPath = `./root/root/folder A/${folderName}`; // Specify the full path to the destination folder
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
