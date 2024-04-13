import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, HydratedDocument, Document } from 'mongoose';

export type FolderDocument = HydratedDocument<Folder>;

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
}

export const FolderSchema = SchemaFactory.createForClass(Folder);
