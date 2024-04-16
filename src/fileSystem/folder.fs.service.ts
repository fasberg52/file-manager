import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promisify } from 'util';
import * as fs from 'fs';

const asyncMkdir = promisify(fs.mkdir);
const asyncExists = promisify(fs.exists);

@Injectable()


export class FileSystemService {
  async createFolder(folderPath: string): Promise<void> {
    try {
      folderPath.split('/').reduce((folders, folder) => {
        folders += `${folder}/`;

        if (!fs.existsSync(folders)) {
          fs.mkdirSync(folders);
        }

        return folders;
      }, '');
    } catch (error) {
      console.log(`Error in FileSystemService for createFolder: `);
      throw new InternalServerErrorException('Failed to create folder');
    }
  }
}
