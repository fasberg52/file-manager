import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  //@UseInterceptors(FileInterceptor('folderPath'))
  @UseInterceptors(FileInterceptor('file',))
  async uploadFile(
    @Body('folderPath') folderPath: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(`file >>> ${file.originalname}`);
    console.log(`folderPath >>> ${folderPath}`);
    try {
     

      if (!folderPath) {
        throw new BadRequestException('Folder path is required');
      }
   
      const uploadedFile = await this.fileService.saveFile(file, folderPath);
     
      return { message: 'File uploaded successfully', file: uploadedFile };
    } catch (error) {
      console.log(`error in uploadFile >>> ${error}`);
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
