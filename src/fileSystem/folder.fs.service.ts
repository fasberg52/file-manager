import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';


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
  async deleteFolder(folderPath: string): Promise<void> {
    try {
      folderPath.split('/').reduce((folders, folder) => {
        folders += `${folder}/`;
        if (fs.existsSync(folders)) {
          fs.rmdirSync(folders);
        }
        return folders;
      }, '');
    } catch (error) {
      console.log(`Error in FileSystemService for deleteFolder: `);
      throw new InternalServerErrorException('Failed to delete folder');
    }
  }

}
