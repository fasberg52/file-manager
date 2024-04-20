import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './model/files.model';
import { FileService } from './files.service';
import { FolderSchema } from 'src/file-manager/models/file-manager.model';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';
import { FileSystemService } from 'src/fileSystem/file.fs.service';

@Module({
  imports: [
    MulterModule.register(multerConfig),
    MongooseModule.forFeature([
      { name: 'File', schema: FileSchema },
      { name: 'Folder', schema: FolderSchema },
    ]),
  ],
  controllers: [FilesController],
  providers: [FileService, FileSystemService],
})
export class FilesModule {}
