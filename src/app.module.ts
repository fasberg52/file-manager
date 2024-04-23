import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FolderModule } from './file-manager/folder.module';
import { MongooseModule } from '@nestjs/mongoose';

import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { HlsModule } from './hls/hls.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1/fileManger'),
    FolderModule,
    FilesModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    HlsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
