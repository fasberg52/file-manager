import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Param,
  Get,
  Res,
} from '@nestjs/common';
import { HlsService } from './hls.service';
import {
  generateHLSDTO,
  GetHLSPathByIdDTO,
  GetHlsPathDTO,
} from './dots/hls.dto';
import { Response } from 'express';
import { FileSystemService } from 'src/fileSystem/file.fs.service';
@Controller('hls')
export class HlsController {
  constructor(
    private readonly hlsService: HlsService,
    private readonly fileSystemService: FileSystemService,
  ) {}

  @Post('convert')
  async convertToHLS(@Body() path: generateHLSDTO) {
    console.log(`path controller: ${path.path}`);
    return this.hlsService.generateHLS(path.path);
  }
  @Get('playlist/:fileId')
  async getHLSPathById(@Param() getHLSPathByIdDTO: GetHLSPathByIdDTO) {
    return this.hlsService.getHLSPathById(getHLSPathByIdDTO);
  }

  @Get('stream/:path')
  async getHlsPath(@Param('path') param: GetHlsPathDTO, @Res() res: Response) {
    console.log(`Streaming file from path >>> ${param.hlsPath}`);
    return this.fileSystemService.streamFile(param.hlsPath, res);
  }
}
