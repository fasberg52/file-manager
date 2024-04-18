import { IsString } from 'class-validator';

export class UpdateFolderDTO {
  @IsString()
  newName: string;
  @IsString()
  oldPath: string;
  @IsString()
  newPath: string;
}
