import { Controller, Post, Body } from '@nestjs/common';
import { FolderService } from './folder.service';
import { createFolderDTO } from './dtos/file-manager.dto';
import { FolderCreateResponse } from './interface/createFolder';

@Controller('/folder')
export class FolderController {
  constructor(private readonly _folderService: FolderService) {}

  @Post('/create')
  async createFolder(
    @Body() createFolderDTO: createFolderDTO,
  ): Promise<FolderCreateResponse> {
    return this._folderService.createFolder(createFolderDTO);
  }
}
