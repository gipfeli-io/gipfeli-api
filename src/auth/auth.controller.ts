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
import {
  ActivateUserDto,
  CreateUserDto,
  LogOutDto,
} from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import {
  LoginDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
  TokenDto,
} from './dto/auth.dto';
import {
  NotificationService,
  NotificationServiceInterface,
} from '../notification/types/notification-service';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RefreshedToken, UserIdentifier } from './types/auth';
import { UserAuthService } from '../user/user-auth.service';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GenericStatusResponseWithContent } from '../utils/types/response';

@ApiTags('auth')
@ApiBadRequestResponse({
  description:
    'Thrown if there are validation errors or otherwise bad requests.',
  type: GenericStatusResponseWithContent,
})
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userAuthService: UserAuthService,
    @Inject(NotificationServiceInterface)
    private notificationService: NotificationService,
  ) {}

  /**
   * Takes an email address and a password and, if successful, creates a user
   * session and returns an access and refresh token.
   * @param req
   */
  @ApiBody({ type: LoginDto })
  @ApiNotFoundResponse({
    description:
      'Thrown if the user cannot be found, so we prevent enumeration attacks at least a bit.',
  })
  @ApiUnauthorizedResponse({
    type: GenericStatusResponseWithContent,
    description: 'Thrown if either email or password is missing.',
  })
  @Throttle(10, 60)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<TokenDto> {
    // Since our guard protects this endpoint, we can directly create a session
    const { sub, email, role } = req.user as UserIdentifier;
    const sessionId = await this.authService.createSession(sub);

    return this.authService.createTokenResponse(sub, email, sessionId, role);
  }

  /**
   * Logs a user out by removing its session ID.
   * @param logoutDto
   */
  @Post('logout')
  async logout(@Body() logoutDto: LogOutDto): Promise<void> {
    await this.authService.deleteSession(logoutDto.sessionId);
  }

  /**
   * Creates a new user and notifies the user via their provided email.
   * @param createUserDto
   */
  @ApiBadRequestResponse({
    description: 'Thrown if there are validation errors.',
    type: LoginDto,
  })
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<void> {
    const { token, user } = await this.userService.create(createUserDto);
    await this.notificationService.sendSignUpMessage(token, user);
  }

  /**
   * Activates a new user account.
   * @param activateUserDto
   */
  @Post('activate')
  async activateUser(@Body() activateUserDto: ActivateUserDto): Promise<void> {
    return this.userAuthService.activateUser(activateUserDto);
  }

  /**
   * Returns a new refresh token for a given session.
   * @param req
   */
  @ApiBearerAuth('default')
  @ApiUnauthorizedResponse({
    description: 'Thrown if not logged-in or supplying invalid tokens.',
  })
  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  async refreshToken(@Request() req): Promise<TokenDto> {
    const { sub, email, sessionId, role } = req.user as RefreshedToken;

    return this.authService.createTokenResponse(sub, email, sessionId, role);
  }

  /**
   * Starts a password reset flow for a given user. If a request is made for a
   * user that does not exists, returns a succesful response nonetheless to
   * avoid enumeration attacks.
   * @param passwordResetRequestDto
   */
  @Throttle(10, 60)
  @Post('password-reset-request')
  async passwordResetRequest(
    @Body() passwordResetRequestDto: PasswordResetRequestDto,
  ): Promise<void> {
    try {
      const { user, token } =
        await this.userAuthService.createPasswordResetTokenForUser(
          passwordResetRequestDto,
        );

      await this.notificationService.sendPasswordResetRequestMessage(
        token,
        user,
      );
    } catch (err) {
      // Only throw errors other than NotFoundException to avoid exposing user
      // registration details.
      if (!(err instanceof NotFoundException)) {
        throw err;
      }
    }
  }

  /**
   * Resets a user's password if they provide a valid reset request token.
   * @param setNewPasswordDto
   */
  @Post('password-reset-set')
  async passwordResetSet(
    @Body() setNewPasswordDto: SetNewPasswordDto,
  ): Promise<void> {
    return this.userAuthService.resetPassword(setNewPasswordDto);
  }
}
