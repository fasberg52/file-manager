import { FileSystemService } from 'src/fileSystem/file.fs.service';
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Hls } from './model/hls.schema';
import { File } from 'src/files/model/files.model';
import { Folder } from 'src/file-manager/models/file-manager.model';
import { convertToHLS, getHLSPathById } from './interface/hls.interface';
import { GetHLSPathByIdDTO } from './dots/hls.dto';

ffmpeg.setFfmpegPath('C:\\Program Files (x86)\\ffmpeg\\bin\\ffmpeg.exe');

@Injectable()
export class HlsService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    private readonly fileSystemService: FileSystemService,
  ) {}
  async generateHLS(filePath: string): Promise<convertToHLS> {
    try {
      const file = await this.fileModel.findOne({ path: filePath });
      if (!file) {
        throw new NotFoundException('File not found');
      }

      const outputPath = this.getHLSOutputPath(file);
      if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
      }
      console.log(`outputPath >>> ${outputPath}`);
      const qualities = [
        { resolution: '426x240', bitrate: '400k' },
        { resolution: '640x360', bitrate: '800k' },
        { resolution: '854x480', bitrate: '1200k' },
        { resolution: '1280x720', bitrate: '2500k' },
      ];

      const masterPlaylistContent = [];
      console.log(`masterPlaylistContent >>> ${masterPlaylistContent}`);

      for (const quality of qualities) {
        const { resolution, bitrate } = quality;
        const playlistFileName = `${file._id.toString()}_${resolution}.m3u8`;
        const playlistFilePath = path.join(outputPath, playlistFileName);

        await this.convertVideoToHLS(
          file.path,
          playlistFilePath,
          resolution,
          bitrate,
        );
        masterPlaylistContent.push(
          `#EXT-X-STREAM-INF:BANDWIDTH=${
            parseInt(bitrate) * 1024
          },RESOLUTION=${resolution}\n${playlistFileName}`,
        );
      }

      const masterPlaylistFilePath = path.join(outputPath, 'master.m3u8');
      console.log(`masterPlaylistFilePath >>> ${masterPlaylistFilePath}`);
      fs.writeFileSync(
        masterPlaylistFilePath,
        `#EXTM3U\n${masterPlaylistContent.join('\n')}`,
      );
      file.hlsPath = outputPath;
      await file.save();
      return {
        statusCode: HttpStatus.OK,
        message: 'HLS conversion completed successfully',
        fileId: file._id.toString(),
        hlsPath: outputPath,
      };
    } catch (error) {
      console.error('Error generating HLS:', error);
      throw new InternalServerErrorException('Failed to generate HLS');
    }
  }

  private async convertVideoToHLS(
    inputPath: string,
    outputPath: string,
    resolution: string,
    bitrate: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-profile:v baseline',
          '-level 3.0',
          `-s ${resolution}`,
          `-b:v ${bitrate}`,
          '-c:v libx264',
          '-c:a aac',
          '-strict -2',
          '-f hls',
          '-hls_time 10',
          '-hls_list_size 0',
        ])
        .output(outputPath)
        .on('end', () => {
          console.log(`HLS conversion for resolution ${resolution} completed.`);

          resolve();
        })
        .on('error', (err) => {
          console.error('Error during HLS conversion:', err);
          reject(err);
        })
        .run();
    });
  }

  private getHLSOutputPath(file: File): string {
    return path.join(path.dirname(file.path), 'hlsVideo', file._id.toString());
  }

  async getHLSPathById(
    getHLSPathByIdDTO: GetHLSPathByIdDTO,
  ): Promise<getHLSPathById> {
    try {
      const { fileId } = getHLSPathByIdDTO;
      console.log(`Searching for HLS path with fileId: ${fileId}`);
      const fileDoc = await this.fileModel.findById(fileId).exec();
      console.log(`Found HLS document: ${fileDoc}`);
      if (!fileDoc || !fileDoc.hlsPath) {
        throw new NotFoundException('HLS file not found');
      }
      return {
        statusCode: HttpStatus.OK,
        data: fileDoc.hlsPath,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error getting HLS path:', error);
      throw new InternalServerErrorException('Failed to get HLS path');
    }
  }
}
