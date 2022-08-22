import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsUUIDApiProperty } from '../../utils/decorators/custom-api-propertes.decorator';

export class SavedGpxFileDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * The identifier as returned by the storage.
   * @example my-folder/dummy-gpx.gpx
   */
  @IsString()
  @IsNotEmpty()
  identifier: string;

  /**
   * The original filename of the GPX file.
   * @example dummy-gpx.gpx
   */
  @IsString()
  @IsNotEmpty()
  name: string;
}
