import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { FolderService } from './folder.service';
import { createFolderDTO } from './dtos/file-manager.dto';
import { FolderCreateResponse } from './interface/createFolder';
import { Folder } from './models/file-manager.model';

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
  async getFolderById(@Param('id') id: string): Promise<Folder> {
    return this._folderService.getFolderById(id);
  }
}
