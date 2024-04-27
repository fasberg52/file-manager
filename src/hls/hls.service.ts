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
    @InjectModel('Hls') private readonly hlsModel: Model<Hls>,
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
      console.log(`outputPath >> ${outputPath}`);

      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await new Promise<void>((resolve, reject) => {
        console.log(`file.path >> ${file.path}`);
        ffmpeg(file.path)
          .output(outputPath)
          .addOptions([
            '-profile:v baseline',
            '-level 3.0',
            '-start_number 0',
            '-hls_time 10',
            '-hls_list_size 0',
            '-f hls',
            '-preset ultrafast',
            '-threads 0',
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

      return {
        statusCode: HttpStatus.OK,
        message: 'ok',
        fileId: file._id.toString(),
        hlsPath: outputPath,
      };
    } catch (error) {
      console.error('Error generating HLS:', error);
      throw new InternalServerErrorException('Failed to generate HLS');
    }
  }

  private getHLSOutputPath(file: File): string {
    return path.join(
      path.dirname(file.path),
      'hlsVideo',
      file._id.toString(),
      `${file._id.toString()}.m3u8`,
    );
  }

  // async getHLSPathById(
  //   getHLSPathByIdDTO: GetHLSPathByIdDTO,
  //   res: Response,
  // ): Promise<getHLSPathById> {
  //   try {
  //     const { fileId } = getHLSPathByIdDTO;
  //     console.log(`Searching for HLS path with fileId: ${fileId}`);

  //     // Validate fileId format
  //     if (!Types.ObjectId.isValid(fileId)) {
  //       throw new BadRequestException('Invalid fileId format');
  //     }

  //     const objectId = fileId;
  //     const hlsDoc = await this.hlsModel.findById(objectId).exec();
  //     console.log(`Found HLS document: ${hlsDoc}`);
  //     if (!hlsDoc || !hlsDoc.hlsPath) {
  //       throw new NotFoundException('HLS file not found');
  //     }
  //     const hlsObject: Hls = {
  //       fileId: objectId,
  //       hlsPath: hlsDoc.hlsPath,
  //     };
  //     await this.fileSystemService.streamFile(hlsDoc.hlsPath, res);
  //     return { statusCode: HttpStatus.OK, data: hlsObject };
  //   } catch (error) {
  //     if (
  //       error instanceof NotFoundException ||
  //       error instanceof BadRequestException
  //     ) {
  //       throw error;
  //     }
  //     console.error('Error getting HLS path:', error);
  //     throw new InternalServerErrorException('Failed to get HLS path');
  //   }
  // }

  async getHLSPathById(
    getHLSPathByIdDTO: GetHLSPathByIdDTO,
    res: Response,
  ): Promise<void> {
    try {
      const { fileId } = getHLSPathByIdDTO;
      console.log(`Searching for HLS path with fileId: ${fileId}`);

      // Validate fileId format
      if (!Types.ObjectId.isValid(fileId)) {
        throw new BadRequestException('Invalid fileId format');
      }

      const objectId = fileId;
      const hlsDoc = await this.hlsModel.findById(objectId).exec();
      console.log(`Found HLS document: ${hlsDoc}`);
      if (!hlsDoc || !hlsDoc.hlsPath) {
        throw new NotFoundException('HLS file not found');
      }

      await this.fileSystemService.streamFile(hlsDoc.hlsPath, res);
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
