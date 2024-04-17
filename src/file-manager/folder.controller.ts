import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FolderService } from './folder.service';
import { createFolderDTO } from './dtos/file-manager.dto';
import { FolderCreateResponse, PathRequest, getFolder } from './interface/createFolder';

@Controller('/folder')
export class FolderController {
  constructor(private readonly _folderService: FolderService) {}

  @Post('/')
  async createFolder(
    @Body() createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    return this._folderService.createFolder(createFolderDTO);
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

  @Get('/checkRootFolder')
  async checkRootFolder(): Promise<boolean> {
    const rootFolderCheck = await this._folderService.checkRootFolder();
    return rootFolderCheck.exists;
  }
}
