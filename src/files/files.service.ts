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
  async saveFile(file: Express.Multer.File, folderPath: string): Promise<File> {
    console.log(folderPath);
    const folder = await this.folderModel.findOne({ path: folderPath });
    console.log(folder);
    if (!folder) {
      throw new Error('Folder not found');
    }
  
    const newFile = new this.fileModel({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      folder: folder._id, 
    });
    await newFile.save();
  
    folder.files.push(newFile._id); 
    await folder.save();
  
    return newFile;
  }
  
}
