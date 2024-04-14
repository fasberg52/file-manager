import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File } from './interfaces/file.interface';
import { Folder } from './../file-manager/models/file-manager.model';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
  ) {}

  async saveFile(file: Express.Multer.File, folderName: string): Promise<File> {
    const folder = await this.folderModel.findOne({ name: folderName });
    if (!folder) {
      throw new Error('Folder not found');
    }
  
    const newFile = new this.fileModel({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folder._id, // Assuming folder._id is the correct reference to the folder in your database
    });
    await newFile.save();
  
    folder.files.push(newFile._id); // Assuming files is an array field in your Folder model
    await folder.save();
  
    return newFile;
  }
  
}
