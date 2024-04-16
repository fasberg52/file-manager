import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FolderSchema } from './models/file-manager.model';
import { FileSystemService } from 'src/fileSystem/folder.fs.service';
import { FolderController } from './folder.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Folder', schema: FolderSchema }]),
  ],
  controllers: [FolderController],
  providers: [FolderService, FileSystemService],
})
export class FolderModule {}
