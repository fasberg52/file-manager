import { HttpStatus } from '@nestjs/common';
import { File } from '../../files/model/files.model';
export interface convertToHLS {
  statusCode: HttpStatus;
  message: string;
  // data: Folder;
  fileId: string;
  hlsPath: string;
}
export interface getHLSPathById {
  statusCode: HttpStatus;
  data: string;
}
