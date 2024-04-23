import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HlsDocument = Hls & Document;

@Schema()
export class Hls {
  @Prop({ required: true })
  fileId: Types.ObjectId;

  @Prop()
  hlsPath: string;
}

export const HlsSchema = SchemaFactory.createForClass(Hls);
