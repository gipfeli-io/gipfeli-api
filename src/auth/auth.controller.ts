import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ActivateUserDto, CreateUserDto } from '../user/dto/user';
import { UserService } from '../user/user.service';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    const { token, user } = await this.userService.create(createUserDto);
    this.notificationService.sendSignUpMessage(token, user);
  }

  @Post('activate')
  async activateUser(@Body() activateUserDto: ActivateUserDto) {
    return this.userService.activateUser(activateUserDto);
  }
}
