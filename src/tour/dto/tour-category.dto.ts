import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsUUIDApiProperty } from '../../utils/decorators/custom-api-propertes.decorator';

export class TourCategoryDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * @example 'Hike'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * @example 'hiking.svg'
   */
  @IsString()
  @IsNotEmpty()
  iconName: string;
}
