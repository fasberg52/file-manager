import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderSchema } from './models/file-manager.model';
import { FolderSystemService } from 'src/fileSystem/folder.fs.service';
import { FolderController } from './folder.controller';
import { FileSchema } from 'src/files/model/files.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Folder', schema: FolderSchema },
      { name: 'File', schema: FileSchema },
    ]),
  ],
  controllers: [FolderController],
  providers: [FolderService, FolderSystemService],
})
export class FolderModule {}
