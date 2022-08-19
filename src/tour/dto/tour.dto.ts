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

export class TourDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsPoint()
  @IsNotEmpty()
  startLocation: Point;

  @IsPoint()
  @IsNotEmpty()
  endLocation: Point;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  updatedAt: Date;

  @IsString()
  userId: string;

  @IsArray()
  images: SavedImageDto[];

  @IsOptional()
  gpxFile: SavedGpxFileDto;

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
