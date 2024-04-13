import { Injectable, InternalServerErrorException } from '@nestjs/common';
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

  async createFolder(createFolderDTO: createFolderDTO): Promise<FolderCreateResponse> {
    try {
      const rootPath = `./root`; // Update root path as needed
      const folderName = createFolderDTO.name;
      let parentFolderPath = rootPath; // Default to root path for top-level folders
      let parentFolder: Folder | null = null;

      // If parent folder ID is provided, find the parent folder
      if (createFolderDTO.parentFolder) {
        parentFolder = await this.folderModel.findById(createFolderDTO.parentFolder);
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
}
