import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FileDocument = File & Document;

@Schema()
export class File {
  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true })
  size: number;

  @Prop()
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder' })
  folder: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
