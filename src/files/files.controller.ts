import {
  Controller,
  Post,
  Get,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FileService) {}
 
  @Post(':folderName/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folderName') folderName: string,
  ) {
    try {
      const uploadedFile = await this.fileService.saveFile(file, folderName);
      return { message: 'File uploaded successfully', file: uploadedFile };
    } catch (error) {
      return { message: 'Error uploading file', error: error.message };
    }
  }
}
