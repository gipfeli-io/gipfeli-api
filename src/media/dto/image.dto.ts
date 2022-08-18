import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsPoint } from '../../tour/dto/validators/is-point.decorator';
import { Point } from 'geojson';

export class SavedImageDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsPoint()
  location: Point | null;
}
