import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './files.service';
import { UpdateFileDTO } from './dtos/file.dto';
import { FileRequest } from './interfaces/file.interface';

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
        throw new BadRequestException('Folder path is required');
      }

      return await this.fileService.saveFile(file, folderPath);
    } catch (error) {
      console.log(`error in uploadFile >>> ${error}`);
      return { message: 'Error uploading file', error: error.message };
    }
  }
  @Put('upload')
  async updateFile(@Body() updateFolderDTO: UpdateFileDTO) {
    return this.fileService.updateFile(updateFolderDTO);
  }
  @Post('delete')
  async deleteFiles(@Body() { filePaths }: FileRequest) {
    return this.fileService.deleteFiles(filePaths);
  }
}
