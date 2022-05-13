import { Tour } from '../../infrastructure/entities/tour.entity';

export interface UserDto {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  tours: Tour[];
}
