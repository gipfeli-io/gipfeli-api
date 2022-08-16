import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SavedGpxFileDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}
