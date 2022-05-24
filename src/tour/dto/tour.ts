import { Point } from 'geojson';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserDto } from '../../user/dto/user';
import {
  IsDate,
  IsInstance,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { IsPoint } from '../../app/decorators/validators/is-point.decorator';

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

  @IsInstance(UserDto)
  @IsNotEmpty()
  user: UserDto;
}

export class UpdateTourDto extends PartialType(
  OmitType(TourDto, ['createdAt', 'updatedAt', 'user']),
) {}

export class CreateTourDto extends OmitType(TourDto, [
  'id',
  'createdAt',
  'updatedAt',
  'user',
] as const) {}
