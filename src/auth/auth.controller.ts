import {
  Body,
  Controller,
  Inject,
  NotFoundException,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { ActivateUserDto, CreateUserDto } from '../user/dto/user';
import { UserService } from '../user/user.service';
import { PasswordResetRequestDto, TokenDto } from './dto/auth';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RefreshedToken, UserIdentifier } from './types/auth';

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
  async login(@Request() req): Promise<TokenDto> {
    // Since our guard protects this endpoint, we can directly create a session
    const { sub, email } = req.user as UserIdentifier;
    const sessionId = await this.authService.createSession(sub);

    return this.authService.createTokenResponse(sub, email, sessionId);
  }

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { token, user } = await this.userService.create(createUserDto);
    await this.notificationService.sendSignUpMessage(token, user);
  }

  @Post('activate')
  async activateUser(@Body() activateUserDto: ActivateUserDto): Promise<void> {
    return this.userService.activateUser(activateUserDto);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req): Promise<TokenDto> {
    const { sub, email, sessionId } = req.user as RefreshedToken;

    return this.authService.createTokenResponse(sub, email, sessionId);
  }

  @Post('password-reset-request')
  async passwordResetRequest(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
  ): Promise<void> {
    try {
      const { user, token } =
        await this.userService.createPasswordResetTokenForUser(
          passwordResetRequestDto,
        );

      await this.notificationService.sendPasswordResetRequestMessage(token, user);
    } catch (err) {
      // Only throw errors other than NotFoundException to avoid exposing user
      // registration details.
      if (!(err instanceof NotFoundException)) {
        throw err;
      }
    }
  }
}
