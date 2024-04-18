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
  async createDirectory(path: string): Promise<void> {
    try {
      await fs.promises.mkdir(path, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create directory at ${path}: ${error.message}`,
      );
    }
  }
  async renameFolder(oldPath: string, newPath: string): Promise<void> {
    try {
      await fs.promises.rename(oldPath, newPath);
    } catch (error) {
      throw new Error(
        `Failed to rename folder from ${oldPath} to ${newPath}: ${error.message}`,
      );
    }
  }

  // async deleteFolder(path: string): Promise<void> {
  //   console.log(`before path ${path}`);
  //   try {
  //     path.split('/').reduce((folders, folder) => {
  //       console.log(`after path ${path}`);

  //       folders += `${folder}/`;
  //       if (fs.existsSync(folders)) {
  //         fs.rmSync(folders, { recursive: true, force: true });
  //       }

  //       return folders;
  //     }, '');
  //   } catch (error) {
  //     console.log(`Error in FileSystemService for deleteFolder: ${error}`);
  //     throw new InternalServerErrorException('Failed to delete folder');
  //   }
  // }

  async deleteFolder(path: string): Promise<void> {
    try {
      if (fs.existsSync(path)) {
        await fs.promises.rm(path, { recursive: true, force: true });
      }
    } catch (error) {
      console.error(`Error in FileSystemService for deleteFolder: ${error}`);
      throw new InternalServerErrorException('Failed to delete folder');
    }
  }
}
