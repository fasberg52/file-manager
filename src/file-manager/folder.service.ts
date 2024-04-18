import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileSystemService } from '../fileSystem/folder.fs.service';
import { Folder, FolderSchema } from './models/file-manager.model';
import { createFolderDTO } from './dtos/file-manager.dto';
import {
  FolderCreateResponse,
  getFolder,
  initializeRootFolder,
} from './interface/createFolder';
import { HttpStatus } from '@nestjs/common';
import { UpdateFolderDTO } from './dtos/updateFolder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    private readonly fileSystemService: FileSystemService,
  ) {}

  async createInitializeRootFolder(): Promise<initializeRootFolder> {
    try {
      const rootFolder = new this.folderModel({
        name: 'Root',
        path: './root',
        parentFolder: null,
      });
      await rootFolder.save();

      await this.fileSystemService.createFolder('./root');

      return {
        statusCode: HttpStatus.OK,
        message: 'ساخته شد',
        data: rootFolder,
        state: true,
      };
    } catch (error) {
      console.error(`Error while initializing root folder: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to initialize root folder',
      );
    }
  }
  async getInitializeRootFolder(): Promise<initializeRootFolder> {
    try {
      const existingRoot = await this.folderModel.findOne({
        name: 'Root',
      });

      if (!existingRoot) {
        return {
          statusCode: HttpStatus.OK,
          state: false,
        };
      } else {
        return {
          statusCode: HttpStatus.OK,
          state: true,
        };
      }
    } catch (error) {
      console.error(`Error while initializing root folder: ${error.message}`);
      throw new InternalServerErrorException(
        'Failed to initialize root folder',
      );
    }
  }

  async createFolder(
    createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    try {
      const rootPath = `./root`;
      const folderName = createFolderDTO.name;
      let fullPath = rootPath;

      let parentFolder = null;

      const existingFolder = await this.folderModel.findOne({
        name: folderName,
      });
      if (existingFolder) {
        throw new ConflictException('Folder with this name already exists');
      }

      if (createFolderDTO.parentFolderPath) {
        const parentFolderPath = createFolderDTO.parentFolderPath; //./root/folderA
        parentFolder = await this.folderModel.findOne({
          path: parentFolderPath,
        });

        if (!parentFolder) {
          throw new NotFoundException('Parent folder not found');
        }
        fullPath = parentFolderPath;
      }

      const folderPath = `${fullPath}/${folderName}`;

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
      await this.fileSystemService.createFolder(folderPath);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Folder created successfully',
        data: folder.toObject(),
      };
    } catch (error) {
      console.error(`Error while creating folder: ${error.message}`);
      if (error instanceof ConflictException) {
        throw error;
      }
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
  async getFolderById(id: string): Promise<getFolder> {
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
  async getFolderByPath(path: string): Promise<getFolder> {
    try {
      console.log(path);

      const trimmedPath = path.trim();
      console.log(trimmedPath);
      const folder = await this.folderModel
        .findOne({ path: trimmedPath })
        .populate({
          path: 'folders',
          select: 'name path',
        })
        .populate({
          path: 'files',
          select: 'originalName mimeType size',
        })
        .exec();

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
      console.error(`Error while getting folder by path: ${error.message}`);
      throw new InternalServerErrorException('Failed to fetch folder');
    }
  }

  async updateFolder(updateFolderDTO: UpdateFolderDTO) {
    try {
      const { newName, oldPath, newPath } = updateFolderDTO;
      const folder = await this.folderModel.findOneAndUpdate(
        { path: oldPath },
        { name: newName, path: newPath },
        { new: true },
      );

      if (!folder) {
        throw new NotFoundException(`مسیر پیدا نشد ${oldPath}`);
      }

      await folder.save();

      await this.fileSystemService.renameFolder(oldPath, newPath);
      return {
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(`Error while updating folder: ${error.message}`);
      throw new InternalServerErrorException('Failed to update folder');
    }
  }
}
