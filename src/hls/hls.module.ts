import { Module } from '@nestjs/common';
import { HlsService } from './hls.service';

@Module({
  providers: [HlsService]
})
export class HlsModule {}
