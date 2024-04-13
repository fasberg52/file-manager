import { HttpStatus } from '@nestjs/common';
export interface Folder {
  _id: string;
  name: string;
  path: string;
  parentFolder: string | null; 
  folders: string[]; 
  __v: number; 
 
}
export interface FolderCreateResponse {
  statusCode: HttpStatus;
  message: string;
  folder: Folder;
}
