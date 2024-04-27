import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';

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
      console.log(`path openFile  >> ${path}`);
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
  async streamFile(filePath: string, res: Response): Promise<void> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File not found');
      }
      const stat = fs.statSync(filePath);
      res.setHeader('Content-Length', stat.size);
      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      const readStream = fs.createReadStream(filePath);
      readStream.pipe(res);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(error);
    }
  }
}
