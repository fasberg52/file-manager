import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Folder extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null })
  parentFolder: string;

  @Prop({ type: [{ type: 'ObjectId', ref: 'Folder' }] })
  folders: Folder[];

  @Prop({ type: [{ type: 'ObjectId', ref: 'File' }] })
  files: Types.ObjectId[];
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
