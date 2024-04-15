import { IsNotEmpty, IsString } from 'class-validator';

export class createFolderDTO {
  @IsString()
  name: string;
  @IsString()
  parentFolder: string;
}
