import { HttpStatus } from '@nestjs/common';
import { Folder } from '../models/file-manager.model';

export interface Folders {
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
  data: Folder;
}

export interface getFolder {
  statusCode: HttpStatus;
  data: Folder;
}

export interface PathRequest {
  path: string;
}

export interface initializeRootFolder {
  statusCode: HttpStatus;
  message?: string;
  data?: Folder;
  state: boolean;
}
