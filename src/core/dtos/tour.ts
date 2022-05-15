import { Point } from 'geojson';
import { PickType } from '@nestjs/mapped-types';
import { UserDto } from './user';

export class TourDto {
  id: string;
  name: string;
  startLocation: Point;
  endLocation: Point;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  user: UserDto;
}

export class UpdateTourDto extends PickType(TourDto, [
  'id',
  'name',
  'startLocation',
  'endLocation',
  'description',
] as const) {}

export class CreateTourDto extends PickType(UpdateTourDto, [
  'name',
  'startLocation',
  'endLocation',
  'description',
] as const) {}
