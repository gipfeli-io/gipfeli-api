import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<User[]> {
    return await this.userService.findAll();
  }
}
