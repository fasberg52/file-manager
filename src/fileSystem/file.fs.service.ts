import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
      await fs.promises.readFile(path);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async serveFile(filePath: string, res: Response): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
