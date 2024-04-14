import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly fileService: FileService) {}
 
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderPath') folderPath: string,
  ) {
    try {
      if (!folderPath) {
        throw new Error('Folder path is required');
      }

      const uploadedFile = await this.fileService.saveFile(file, folderPath);
      return { message: 'File uploaded successfully', file: uploadedFile };
    } catch (error) {
      return { message: 'Error uploading file', error: error.message };
    }
  }
}

