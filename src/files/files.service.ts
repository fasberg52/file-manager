import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File, SaveFile, UpdateFile } from './interfaces/file.interface';
import { Folder } from 'src/file-manager/models/file-manager.model';
import { uniqueFilename } from './multer.config';
import { UpdateFileDTO } from './dtos/file.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
  ) {}
  async saveFile(
    file: Express.Multer.File,
    folderPath: string,
  ): Promise<SaveFile> {
    const folder = await this.folderModel.findOne({ path: folderPath });

    if (!folder) {
      throw new Error('Folder not found');
    }

    const fullPath = `${folder.path}/${uniqueFilename}`;

    const newFile = new this.fileModel({
      originalName: uniqueFilename,
      mimeType: file.mimetype,
      size: file.size,
      folder: folder._id,
      path: fullPath,
    });
    await newFile.save();

    folder.files.push(newFile._id);
    await folder.save();

    return {
      statusCode: HttpStatus.OK,
      message: 'فایل آپلود شد',
      data: newFile,
    };
  }

  async updateFile(updateFolderDTO: UpdateFileDTO): Promise<UpdateFile> {
    try {
      const { newName, oldPath, newPath } = updateFolderDTO;
      const file = await this.fileModel.findOneAndUpdate(
        { path: oldPath },
        { name: newName, path: newPath },
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'فایل ویرایش شد',
      };
    } catch (error) {}
  }
}
