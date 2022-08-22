import { Point } from 'geojson';
import { OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { IsPoint } from './validators/is-point.decorator';
import { SavedImageDto } from '../../media/dto/image.dto';
import { SavedGpxFileDto } from '../../media/dto/gpx-file.dto';
import { TourCategoryDto } from './tour-category.dto';
import { Type } from 'class-transformer';
import {
  IsPointApiProperty,
  IsUUIDApiProperty,
} from '../../utils/decorators/custom-api-propertes.decorator';

export class TourDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * @example 'Ridgewalk along the Harder Grat'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPointApiProperty('Start location of the tour.')
  @IsPoint()
  @IsNotEmpty()
  startLocation: Point;

  @IsPointApiProperty('End location of the tour.')
  @IsPoint()
  @IsNotEmpty()
  endLocation: Point;

  /**
   * @example 'Lorem ipsum dolor sic amet, yet not really.'
   */
  @IsString()
  @IsNotEmpty()
  description: string;

  /**
   * @example 2022-08-16T13:24:14.185Z
   */
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  /**
   * @example 2022-08-16T13:24:14.185Z
   */
  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @IsUUIDApiProperty()
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SavedImageDto)
  images: SavedImageDto[];

  @IsOptional()
  gpxFile: SavedGpxFileDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => TourCategoryDto)
  categories: TourCategoryDto[];
}

export class UpdateTourDto extends PartialType(
  OmitType(TourDto, ['createdAt', 'updatedAt', 'userId']),
) {}

export class CreateTourDto extends OmitType(TourDto, [
  'id',
  'createdAt',
  'updatedAt',
  'userId',
] as const) {}
