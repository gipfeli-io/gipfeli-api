import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SavedImageDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;
}
