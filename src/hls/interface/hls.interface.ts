import { HttpStatus } from '@nestjs/common';
import { Folder } from 'src/file-manager/models/file-manager.model';
import { Hls } from '../model/hls.schema';

export interface convertToHLS {
  statusCode: HttpStatus;
  message: string;
  // data: Folder;
  fileId: string;
  hlsPath: string;
}
export interface getHLSPathById {
  statusCode: HttpStatus;
  data: Hls;
}
