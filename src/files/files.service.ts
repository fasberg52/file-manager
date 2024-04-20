import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { File, SaveFile, UpdateFile } from './interfaces/file.interface';
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
        { name: newName, path: newPath },
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
  async deleteFiles(filePaths: string[]): Promise<void> {
    try {
      await Promise.all(
        filePaths.map(async (filePath) => {
          const file = await this.fileModel.findOne({ path: filePath });
          if (!file) {
            throw new NotFoundException(`File at path ${filePath} not found`);
          }

          await this.fileSystemService.deleteFiles(filePaths);

          const folderId = file.folder;
          const folder = await this.folderModel.findById(folderId);
          if (!folder) {
            throw new NotFoundException(`Folder with ID ${folderId} not found`);
          }
          const index = folder.files.indexOf(file._id);
          if (index !== -1) {
            folder.files.splice(index, 1);
            await folder.save();
          }

          await this.fileModel.findByIdAndDelete(file._id);
        }),
      );
    } catch (error) {
      console.error(`Error while deleting files: ${error.message}`);
      throw new InternalServerErrorException('Failed to delete files');
    }
  }
}
