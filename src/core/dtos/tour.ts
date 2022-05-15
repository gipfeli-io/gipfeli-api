import { Point } from 'geojson';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { UserDto } from './user';
import {
  IsDate,
  IsInstance,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';

export class TourDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  // TOdo: custom validator
  startLocation: Point;

  // TOdo: custom validator
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
  @IsNotEmpty() // Todo: Handle how we assign the user
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
