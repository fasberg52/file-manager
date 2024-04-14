import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileManagerModule } from './file-manager/folder.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './files/multer.config';

@Module({
  imports: [
    MulterModule.register(multerConfig),
    MongooseModule.forRoot('mongodb://127.0.0.1/fileManger'),
    FileManagerModule,
   
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
