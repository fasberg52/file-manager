import { Module } from '@nestjs/common';
import { HlsService } from './hls.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from 'src/files/model/files.model';
import { FolderSchema } from 'src/file-manager/models/file-manager.model';
import { HlsSchema } from './model/hls.schema';
import { HlsController } from './hls.controller';
import { FileSystemService } from 'src/fileSystem/file.fs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'File', schema: FileSchema },
      { name: 'Hls', schema: HlsSchema },
    ]),
  ],
  providers: [HlsService, FileSystemService],
  controllers: [HlsController],
})
export class HlsModule {}
