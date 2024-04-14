import { Folder } from './../file-manager/models/file-manager.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './interfaces/file.interface';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
  ) {}

  async saveFile(file: Express.Multer.File, folderId: string): Promise<File> {
    const folder = await this.folderModel.findById(folderId);
    if (!folder) {
      throw new Error('Folder not found');
    }

    const newFile = new this.fileModel({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folderId,
    });
    await newFile.save();

    folder.files.push(newFile._id);
    await folder.save();

    return newFile;
  }
}
