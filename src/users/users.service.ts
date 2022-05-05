import { Injectable } from '@nestjs/common';
import { UserDummy } from './user-dummy';

@Injectable()
export class UsersService {
  private readonly users: UserDummy[] = [
    {
      id: 1,
      email: 'john@gipfeli.io',
      password: '1234',
    },
    {
      id: 2,
      email: 'samantha@gipfeli.io',
      password: '1234',
    },
  ];

  async findOne(email: string): Promise<UserDummy | undefined> {
    return this.users.find((user) => user.email === email);
  }
}
