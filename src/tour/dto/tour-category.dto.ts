import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TourCategoryDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;
  @IsString()
  @IsNotEmpty()
  name: string;
}
