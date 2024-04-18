import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { FolderService } from './folder.service';
import { createFolderDTO } from './dtos/file-manager.dto';
import {
  FolderCreateResponse,
  PathRequest,
  getFolder,
} from './interface/createFolder';
import { UpdateFolderDTO } from './dtos/updateFolder.dto';

@Controller('/folder')
export class FolderController {
  constructor(private readonly _folderService: FolderService) {}

  @Post('/')
  async createFolder(
    @Body() createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    return this._folderService.createFolder(createFolderDTO);
  }

  @Get('/initialize-root-folder')
  async getInitializeRootFolder() {
    return this._folderService.getInitializeRootFolder();
  }
  @Post('/initialize-root-folder')
  async postInitializeRootFolder() {
    return this._folderService.createInitializeRootFolder();
  }

  @Get('/')
  async getAllFolders() {
    return this._folderService.getAll();
  }

  @Get('/:id')
  async getFolderById(@Param('id') id: string): Promise<getFolder> {
    return this._folderService.getFolderById(id);
  }

  @Post('/path')
  async getFolderByPath(@Body() path: PathRequest): Promise<getFolder> {
    return this._folderService.getFolderByPath(path.path);
  }

  @Put('/')
  async updateFolder(@Body() updateFolderDTO: UpdateFolderDTO) {
    return this._folderService.updateFolder(updateFolderDTO);
  }
  @Delete('/')
  async deleteFolder(@Body() path: PathRequest) {
    console.log(`OOO ` + path.path);
    return this._folderService.deleteFolders([path.path]);
  }
}
