import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsPoint } from '../../tour/dto/validators/is-point.decorator';
import { Point } from 'geojson';
import IsPointApiPropertyDecorator from '../../tour/IsPointApiProperty.decorator';

export class SavedImageDto {
  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
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

  @IsPointApiPropertyDecorator(
    'Location of the tour - may be null if no coordinates were found.',
  )
  @IsPoint()
  location: Point | null;
}
