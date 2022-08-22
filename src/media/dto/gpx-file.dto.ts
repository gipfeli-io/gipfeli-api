import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SavedGpxFileDto {
  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
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
