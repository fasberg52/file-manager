import { FileService } from './../files.service';
import { HttpStatus } from '@nestjs/common';

// file.interface.ts
export interface File {
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
}
export interface SaveFile {
  message: string;
  statusCode: HttpStatus;
  data: File;
}
// folder.interface.ts
export interface Folder {
  name: string;
  path: string;
  files: string[]; // Array of file IDs
}
export interface UpdateFile {
  statusCode: HttpStatus;
  message: string;
}

export interface FileServiceResponse {
  statusCode: HttpStatus;
  message: string;
}

export interface FileRequest {
  filePaths: string[];
}
