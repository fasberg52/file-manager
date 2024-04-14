import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileSystemService } from '../fileSystem/fileSystemService';
import { Folder } from './models/file-manager.model';
import { createFolderDTO } from './dtos/file-manager.dto';
import { FolderCreateResponse } from './interface/createFolder';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    private readonly fileSystemService: FileSystemService,
  ) {}

  async createFolder(
    createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    try {
      const rootPath = `./root`;
      const folderName = createFolderDTO.name;
      let parentFolderPath = rootPath;
      let parentFolder: Folder | null = null;

      if (createFolderDTO.parentFolder) {
        parentFolder = await this.folderModel.findById(
          createFolderDTO.parentFolder,
        );
        if (!parentFolder) {
          throw new Error('Parent folder not found');
        }
        parentFolderPath = parentFolder.path;
      }

      const folderPath = `${parentFolderPath}/${folderName}`;
      await this.fileSystemService.createFolder(rootPath, folderPath);

      const folder = new this.folderModel({
        name: folderName,
        path: folderPath,
        parentFolder: parentFolder ? parentFolder._id : null,
        parentFolderName: parentFolder.name,
        parentFolderPath: parentFolder ? parentFolder.path : null,
      });
      await folder.save();

      if (parentFolder) {
        parentFolder.folders.push(folder._id);
        await parentFolder.save();
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Folder created successfully',
        folder: folder.toObject(),
      };
    } catch (error) {
      console.error(`Error while creating folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to create folder');
    }
  }
  async getAll(): Promise<Folder[]> {
    try {
      const folders = await this.folderModel.find().exec();
      return folders;
    } catch (error) {
      console.error(`Error while fetching folders: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folders');
    }
  }
  async getFolderById(id: string): Promise<Folder> {
    try {
      const folder = await this.folderModel
        .findById(id)
        .populate('folders', 'name path')
        .exec();
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      return folder;
    } catch (error) {
      console.error(`Error while getting folder by ID: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folder');
    }
  }
}
