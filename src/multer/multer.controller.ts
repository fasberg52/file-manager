import { Controller, Post, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  @Post(':folderId/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('folderId') folderId: string,
  ) {
    // Handle file upload logic here
    console.log('Uploaded file:', file);
    console.log('Folder ID:', folderId);
    // You can save file details to the database or perform other actions
    return { message: 'File uploaded successfully' };
  }
}
