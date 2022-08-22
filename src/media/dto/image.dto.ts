import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsPoint } from '../../tour/dto/validators/is-point.decorator';
import { Point } from 'geojson';
import {
  IsUUIDApiProperty,
  IsPointApiProperty,
} from '../../utils/decorators/custom-api-propertes.decorator';

export class SavedImageDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * The identifier as returned by the storage.
   * @example my-folder/dummy-image.jpg
   */
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsPointApiProperty(
    'Location of the tour - may be null if no coordinates were found.',
  )
  @IsPoint()
  location: Point | null;
}
