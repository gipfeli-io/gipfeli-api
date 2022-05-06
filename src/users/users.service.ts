import { Injectable } from '@nestjs/common';
import { UserDummy } from './user-dummy';

@Injectable()
export class UsersService {
  private readonly users: UserDummy[] = [
    {
      id: 1,
      username: 'john@gipfeli.io',
      password: '1234',
    },
    {
      id: 2,
      username: 'samantha@gipfeli.io',
      password: '1234',
    },
  ];

  async findOne(username: string): Promise<UserDummy | undefined> {
    return this.users.find((user) => user.username === username);
  }
}
