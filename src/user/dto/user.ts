import { Tour } from '../../tour/entities/tour.entity';

export class UserDto {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  password: string;
  tours: Tour[];
}
