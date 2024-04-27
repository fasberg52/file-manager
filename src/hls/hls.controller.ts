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
import { generateHLSDTO, GetHLSPathByIdDTO } from './dots/hls.dto';
import { Response } from 'express';
@Controller('hls')
export class HlsController {
  constructor(private readonly hlsService: HlsService) {}

  @Post('convert')
  async convertToHLS(@Body() path: generateHLSDTO) {
    console.log(`path controller: ${path.path}`);
    return this.hlsService.generateHLS(path.path);
  }
  @Get('playlist/:fileId')
  async getHLSPathById(
    @Param() getHLSPathByIdDTO: GetHLSPathByIdDTO,
    @Res() res: Response,
  ) {
    return this.hlsService.getHLSPathById(getHLSPathByIdDTO, res);
  }
}
