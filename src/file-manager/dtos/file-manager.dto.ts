import { IsNotEmpty, IsString } from 'class-validator';

export class createFolderDTO {
  @IsString({message: 'Name must be a string'})
  @IsNotEmpty()
  name: string;
  @IsString()
  parentFolderPath?: string;
}
