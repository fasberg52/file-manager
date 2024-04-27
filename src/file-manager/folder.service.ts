import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FolderSystemService } from '../fileSystem/folder.fs.service';
import { Folder } from './models/file-manager.model';
import { File } from '../files/model/files.model';
import { createFolderDTO } from './dtos/file-manager.dto';
import {
  FolderCreateResponse,
  deleteFolderAndContents,
  getFolder,
  initializeRootFolder,
} from './interface/createFolder';
import { HttpStatus } from '@nestjs/common';
import { UpdateFolderDTO } from './dtos/updateFolder.dto';

@Injectable()
export class FolderService {
  constructor(
    @InjectModel(Folder.name) private readonly folderModel: Model<Folder>,
    @InjectModel(File.name) private readonly fileModel: Model<File>,
    private readonly FolderSystemService: FolderSystemService,
  ) {}

  async createInitializeRootFolder(): Promise<initializeRootFolder> {
    try {
      const rootFolder = new this.folderModel({
        name: 'Root',
        path: './root',
        parentFolder: null,
      });
      await rootFolder.save();

      await this.FolderSystemService.createFolder('./root');

      return {
        statusCode: HttpStatus.OK,
        message: 'ساخته شد',
        data: rootFolder,
        state: true,
      };
    } catch (error) {
      console.error(
        `Error while initializing root folder: ${(error as Error).message}`,
      );
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
      console.error(
        `Error while initializing root folder: ${(error as Error).message}`,
      );
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
      await this.FolderSystemService.createFolder(folderPath);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Folder created successfully',
        data: folder.toObject(),
      };
    } catch (error) {
      console.error(`Error while creating folder: ${(error as Error).message}`);
      if (error instanceof ConflictException || NotFoundException) {
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
      console.error(
        `Error while fetching folders: ${(error as Error).message}`,
      );
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
      console.error(
        `Error while getting folder by ID: ${(error as Error).message}`,
      );
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
          select: 'originalName mimeType size path',
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `Error while getting folder by path: ${(error as Error).message}`,
      );
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

      await this.FolderSystemService.renameFolder(oldPath, newPath);
      return {
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `Error while updating folder: ${(error as Error).message}}`,
      );
      throw new InternalServerErrorException('Failed to update folder');
    }
  }

  async deleteFolders(folderPaths: string[]): Promise<deleteFolderAndContents> {
    try {
      for (const folderPath of folderPaths) {
        await this.deleteFolderAndContents(folderPath);
      }
      return {
        statusCode: HttpStatus.OK,
        message: 'مسیر با موفقیت حذف شد',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `Error while deleting folders: ${(error as Error).message}}`,
      );
      throw new InternalServerErrorException('Failed to delete folders');
    }
  }

  private async deleteFolderAndContents(folderPath: string): Promise<void> {
    try {
      const folder = await this.folderModel.findOne({ path: folderPath });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      await this.fileModel.deleteMany({ folder: folder._id });

      // Recursively delete subfolders and their contents
      const subfolders = await this.folderModel.find({
        parentFolder: folder._id,
      });
      for (const subfolder of subfolders) {
        await this.deleteFolderAndContents(subfolder.path);
      }

      await this.FolderSystemService.deleteFolder(folderPath);
      await this.folderModel.findByIdAndDelete(folder._id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(
        `Error while deleteFolderAndContents: ${(error as Error).message}}`,
      );

      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  // async deleteFolder(folderPath: string): Promise<void> {
  //   try {
  //     console.log(`folderPath >>>>> ${folderPath}`);
  //     const folder = await this.folderModel.findOne({
  //       path: folderPath,
  //     });
  //     if (!folder) {
  //       throw new NotFoundException('Folder not found');
  //     }
  //     const parentFolder = await this.folderModel.findOne({
  //       _id: folder.parentFolder,
  //     });
  //     console.log(`parentFolder ${parentFolder}`);

  //     if (parentFolder) {
  //       const index = parentFolder.folders.indexOf(folder._id);
  //       if (index > -1) {
  //         parentFolder.folders.splice(index, 1);
  //         await parentFolder.save();
  //       }
  //     }
  //     console.log(`After parentFolder ${parentFolder}`);

  //     await this.FolderSystemService.deleteFolder(folderPath);
  //     await this.folderModel.findByIdAndDelete(folder._id); // This replaces folder.remove()
  //     return;
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     console.error(`Error while deleting folder: ${(error as Error).message}`);
  //     throw new InternalServerErrorException('Failed to delete folder');
  //   }
  // }

  // async deleteFolder(path: string): Promise<void> {
  //   try {
  //     console.log(path);

  //     const deletedFolder = await this.folderModel.findOneAndDelete({
  //       path: path,
  //     });

  //     if (!deletedFolder) {
  //       throw new NotFoundException(`Folder not found at path ${path}`);
  //     }
  //     await this.FolderSystemService.deleteFolder(path);
  //   } catch (error) {
  //     console.error(
  //       `Error in FolderService for deleteFolder: ${(error as Error).message}`,
  //     );
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException('Failed to delete folder');
  //   }
  // }
}
