import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Put,
  Get,
  Query,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileService } from './files.service';
import { UpdateFileDTO } from './dtos/file.dto';
import { FileRequest } from './interfaces/file.interface';
import * as path from 'path';
import { Response } from 'express';

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
  @Get('open')
  async openFile(@Query('path') path: string) {
    return this.fileService.openFile(path);
  }

  @Get(':fileName')
  async serveFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const baseDirectory = this.fileService.getBaseDirectory(); // This should be implemented in your service

    const filePath = path.resolve(baseDirectory, fileName);
    console.log(`filePath >>>  ${filePath}`);
    console.log(`baseDirectory >>> ${baseDirectory} and ${fileName}`);
    await this.fileService.serveFile(filePath, res);
  }
}
