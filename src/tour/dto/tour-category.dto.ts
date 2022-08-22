import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class TourCategoryDto {
  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * @example 'Hike'
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
