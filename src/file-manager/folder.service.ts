import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileSystemService } from '../fileSystem/folder.fs.service';
import { Folder } from './models/file-manager.model';
import { createFolderDTO } from './dtos/file-manager.dto';
import { FolderCreateResponse, getFolderById } from './interface/createFolder';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    private readonly fileSystemService: FileSystemService,
  ) {}
  async initializeRootFolder(): Promise<void> {
    try {
      const existingRoot = await this.folderModel.findOne({
        parentFolder: null,
      });
      if (!existingRoot) {
        const rootFolder = new this.folderModel({
          name: 'Root',
          path: './root',
          parentFolder: null,
        });
        await rootFolder.save();
      }
    } catch (error) {
      console.error(`Error while initializing root folder: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to initialize root folder',
      );
    }
  }
  // async createFolder(
  //   createFolderDTO: createFolderDTO,
  // ): Promise<FolderCreateResponse> {
  //   try {
  //     const rootPath = `./root`;
  //     const folderName = createFolderDTO.name;
  //     let fullPath = rootPath;

  //     let parentFolder = null;

  //     if (createFolderDTO.parentFolder) {
  //       parentFolder = await this.folderModel.findById(
  //         createFolderDTO.parentFolder,
  //       );
  //       if (!parentFolder) {
  //         throw new NotFoundException('Parent folder not found');
  //       }
  //       fullPath = parentFolder.path;
  //     }

  //     const folderPath = `${fullPath}/${folderName}`;
  //     await this.fileSystemService.createFolder(folderPath);

  //     const folder = new this.folderModel({
  //       name: folderName,
  //       path: folderPath,
  //       parentFolder: parentFolder ? parentFolder._id : null,
  //     });
  //     await folder.save();

  //     if (parentFolder) {
  //       parentFolder.folders.push(folder._id);
  //       await parentFolder.save();
  //     }

  //     return {
  //       statusCode: HttpStatus.CREATED,
  //       message: 'Folder created successfully',
  //       folder: folder.toObject(),
  //     };
  //   } catch (error) {
  //     console.error(`Error while creating folder: ${error.message}`);
  //     throw new InternalServerErrorException('Failed to create folder');
  //   }
  // }

  async createFolder(
    createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    try {
      // Ensure root folder is initialized
      await this.initializeRootFolder(); // Assuming this method checks for and creates the root folder if not present

      const rootPath = `./root`;
      const folderName = createFolderDTO.name;
      let fullPath = rootPath;

      let parentFolder = null;

      if (createFolderDTO.parentFolder) {
        parentFolder = await this.folderModel.findById(
          createFolderDTO.parentFolder,
        );
        if (!parentFolder) {
          throw new NotFoundException('Parent folder not found');
        }
        fullPath = parentFolder.path;
      }

      const folderPath = `${fullPath}/${folderName}`;
      await this.fileSystemService.createFolder(folderPath);

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
        data: folder.toObject(),
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
  async getFolderById(id: string): Promise<getFolderById> {
    try {
      console.log(`id is : ${id}`);
      const folder = await this.folderModel
        .findById(id)
        .populate({
          path: 'folders',
          select: 'name path',
        })
        .populate({
          path: 'files',
          select: 'originalName mimeType size',
        })
        .exec();
      console.log(`folder is : ${folder}`);

      if (!folder) {
        throw new NotFoundException('Folder not found');
      } else if (!folder._id) {
        throw new NotFoundException('Folder not found');
      }
      return {
        statusCode: HttpStatus.OK,
        data: folder.toObject(),
      };
    } catch (error) {
      console.error(`Error while getting folder by ID: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folder');
    }
  }
  async checkRootFolder(): Promise<{ exists: boolean; rootFolderId?: string }> {
    try {
      const rootFolder = await this.folderModel.findOne({ name: 'Root' });
      if (rootFolder) {
        return { exists: true, rootFolderId: rootFolder._id.toString() };
      }
      return { exists: false };
    } catch (error) {
      console.error(`Error while checking root folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to check root folder');
    }
  }
}
