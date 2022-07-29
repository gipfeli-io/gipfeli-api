import { Point } from 'geojson';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsArray, IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { IsPoint } from './validators/is-point.decorator';
import { SavedImageDto } from '../../media/dto/image';

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
