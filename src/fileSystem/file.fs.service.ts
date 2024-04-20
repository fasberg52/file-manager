import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class FileSystemService {
  async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await fs.promises.rename(oldPath, newPath);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async deleteFiles(paths: string[]): Promise<void> {
    try {
      await paths.reduce(async (previousPromise, path) => {
        await previousPromise;
        return fs.promises.unlink(path);
      }, Promise.resolve());
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async openFile(path: string): Promise<void> {
    try {
      await fs.promises.open(path, 'r');
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
