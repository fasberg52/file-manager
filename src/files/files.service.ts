import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  File,
  FileServiceResponse,
  SaveFile,
  UpdateFile,
} from './interfaces/file.interface';
import { Folder } from 'src/file-manager/models/file-manager.model';
import { uniqueFilename } from './multer.config';
import { UpdateFileDTO } from './dtos/file.dto';
import { FileSystemService } from 'src/fileSystem/file.fs.service';

@Injectable()
export class FileService {
  constructor(
    @InjectModel('File') private readonly fileModel: Model<File>,
    @InjectModel('Folder') private readonly folderModel: Model<Folder>,
    private readonly fileSystemService: FileSystemService,
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
      console.log(newName + `---` + oldPath + `---` + newPath);
      const existingFile = await this.fileModel.findOne({ path: oldPath });
      if (!existingFile) {
        throw new NotFoundException('File not found');
      }
      const updatedFile = await this.fileModel.findOneAndUpdate(
        { path: oldPath },
        { name: newName, originalName: newName, path: newPath },
        { new: true },
      );

      await this.fileSystemService.renameFile(oldPath, newPath);
      console.log('updatedFile  >> ' + updatedFile);

      return {
        statusCode: HttpStatus.OK,
        message: 'فایل ویرایش شد',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.log(`Error in UpdateFile ${error}`);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
  // async deleteFiles(filePaths: string[]): Promise<FileServiceResponse> {
  //   try {
  //     console.log(filePaths);
  //     if (!Array.isArray(filePaths)) {
  //       throw new Error('filePaths must be an array');
  //     }
  //     await Promise.all(
  //       filePaths.map(async (filePath) => {
  //         console.log(`filePath>> ${filePath}`);
  //         const file = await this.fileModel.findOne({ path: filePath });
  //         if (!file) {
  //           throw new NotFoundException(`File at path ${filePath} not found`);
  //         }
  //         await this.fileModel.deleteOne({ _id: file._id });
  //         await this.fileSystemService.deleteFiles([filePath]);
  //       }),
  //     );

  //     return {
  //       message: 'فایل با موفقیت حذف شد',
  //       statusCode: HttpStatus.OK,
  //     };
  //   } catch (error) {
  //     console.error(`Error while deleting files: ${error.message}`);
  //     throw new InternalServerErrorException('Failed to delete files');
  //   }
  // }

  async deleteFiles(filePaths: string[]): Promise<FileServiceResponse> {
    try {
      console.log(filePaths);
      if (!Array.isArray(filePaths)) {
        throw new Error('filePaths must be an array');
      }
      await Promise.all(
        filePaths.map(async (filePath) => {
          const file = await this.fileModel.findOne({ path: filePath });
          if (!file) {
            throw new NotFoundException(`File at path ${filePath} not found`);
          }
          await this.folderModel.updateOne(
            { _id: file.folder },
            { $pull: { files: file._id } },
          );
          await this.fileSystemService.deleteFiles([filePath]);
          await this.fileModel.deleteOne({ _id: file._id });
        }),
      );

      return {
        message: 'فایل با موفقیت حذف شد',
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error(`Error while deleting files: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete files');
    }
  }
}
