import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FileSchema } from './model/files.model'; 

@Module({
  imports: [MongooseModule.forFeature([{ name: 'File', schema: FileSchema }])],
  controllers: [FilesController],
  providers: [],
})
export class FilesModule {}
