import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';

const asyncMkdir = promisify(fs.mkdir);
const asyncExists = promisify(fs.exists);

@Injectable()
export class FileSystemService {
  async createFolder(rootPath: string, folderPath: string): Promise<void> {
    try {
      const folders = folderPath.split('/');
      let currentPath = rootPath;

      for (const folder of folders) {
        currentPath += `/${folder}`;
        await asyncMkdir(currentPath).catch(() => {});
      }
    } catch (error) {
      console.log(`Error in FileSystemService for createFolder: ${error}`);
      throw new InternalServerErrorException('Failed to create folder');
    }
  }
}
