import { Point } from 'geojson';
import { User } from '../../infrastructure/entities/user.entity';
import { PartialType, PickType } from '@nestjs/mapped-types';

export class TourDto {
  id: string;
  name: string;
  startLocation: Point;
  endLocation: Point;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export class CreateTourDto extends PickType(TourDto, [
  'name',
  'startLocation',
  'endLocation',
  'description',
] as const) {}

export class UpdateTourDto extends PartialType(CreateTourDto) {}
