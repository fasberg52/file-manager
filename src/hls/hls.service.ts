import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { File } from 'src/files/model/files.model';
import { Hls } from './model/hls.schema';

@Injectable()
export class HlsService {
  constructor(
    @InjectModel(Hls.name) private readonly hlsModel: Model<Hls>,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async generateHLS(fileId: string): Promise<void> {
    try {
      const file = await this.fileModel.findById(fileId);
      if (!file) {
        throw new NotFoundException('File not found');
      }

      const outputPath = this.getHLSOutputPath(file);
      this.createDirectoryIfNeeded(path.dirname(outputPath));

      await new Promise<void>((resolve, reject) => {
        ffmpeg(file.path)
          .output(outputPath)
          .addOptions([
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            '-hls_time 10',
            '-hls_list_size 0',
            '-f hls',
          ])
          .outputOptions('-c:a aac')
          .outputOptions('-strict -2')
          .on('end', async () => {
            console.log('HLS conversion complete');
            const hlsDoc = new this.hlsModel({
              fileId: file._id,
              hlsPath: outputPath,
              // Other HLS metadata properties if any
            });
            await hlsDoc.save();
            resolve();
          })
          .on('error', (err) => {
            console.error('Error during HLS conversion:', err);
            reject(err);
          })
          .run();
      });
    } catch (error) {
      console.error('Error generating HLS:', error);
      throw new InternalServerErrorException('Failed to generate HLS');
    }
  }

  private getHLSOutputPath(file: File): string {
    return path.join(path.dirname(file.path), 'hls', file.originalName);
  }

  private createDirectoryIfNeeded(directoryPath: string): void {
    if (!fs.existsSync(directoryPath)) {
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }

  async getHLSPlaylist(fileId: string): Promise<string> {
    try {
      const hlsDoc = await this.hlsModel.findOne({
        fileId: Types.ObjectId.createFromHexString(fileId),
      });
      if (!hlsDoc || !hlsDoc.hlsPath) {
        throw new NotFoundException('HLS file not found');
      }

      const playlist = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n${hlsDoc.hlsPath}/index.m3u8`;
      return playlist;
    } catch (error) {
      console.error('Error getting HLS playlist:', error);
      throw new InternalServerErrorException('Failed to get HLS playlist');
    }
  }
}
