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
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderPath') folderPath: string,
  ) {
    //console.log(`file >>> ${file.originalname}`);
    //console.log(`folderPath >>> ${folderPath}`);
    try {
      const fileWithBody = {
        file: file,
        folderPath: folderPath,
      };

      if (!folderPath) {
        throw new BadRequestException('Folder path is required');
      }

      return await this.fileService.saveFile(file, folderPath);

      //return { message: 'File uploaded successfully', file: uploadedFile };
    } catch (error) {
      console.log(`error in uploadFile >>> ${error}`);
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
