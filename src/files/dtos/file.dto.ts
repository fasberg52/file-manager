import { IsArray, IsString } from 'class-validator';

export class UpdateFileDTO {
  @IsString()
  newName: string;
  @IsString()
  newPath: string;
  @IsString()
  oldPath: string;
}
export class DeleteFileDTO {
  @IsArray()
  filePaths: [];
}
