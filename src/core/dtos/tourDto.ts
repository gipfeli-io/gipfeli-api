import { Point } from 'geojson';
import { User } from '../../infrastructure/entities/user.entity';

export interface TourDto {
  id: string;

  name: string;

  startLocation: Point;

  endLocation: Point;

  description: string;

  CreatedAt: Date;

  UpdatedAt: Date;

  user: User;
}
