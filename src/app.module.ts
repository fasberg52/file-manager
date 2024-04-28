import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HlsModule } from './hls/hls.module';
import { FolderModule } from './file-manager/folder.module';
import { FilesModule } from './files/files.module';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'root'),
      // serveRoot: '/static/hlsVideo',
    }),
    MongooseModule.forRoot('mongodb://127.0.0.1/fileManger'),
    FolderModule,
    FilesModule,
    HlsModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
