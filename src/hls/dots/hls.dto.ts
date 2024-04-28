import { IsNotEmpty, IsString } from 'class-validator';

export class generateHLSDTO {
  @IsNotEmpty()
  @IsString()
  path: string;
}

export class GetHLSPathByIdDTO {
  @IsNotEmpty()
  @IsString()
  fileId: string;
}

export class GetHlsPathDTO {
  @IsNotEmpty()
  @IsString()
  hlsPath: string;
}
