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
import IsPointApiPropertyDecorator from '../IsPointApiProperty.decorator';

export class TourDto {
  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * @example 'Ridgewalk along the Harder Grat'
   */
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPointApiPropertyDecorator('Start location of the tour.')
  @IsPoint()
  @IsNotEmpty()
  startLocation: Point;

  @IsPointApiPropertyDecorator('End location of the tour.')
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

  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
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
