import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserDto } from '../../core/dtos/user';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getUsers(): Promise<UserDto[]> {
    return await this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    console.log('request', req);
    return req.user;
  }
}
