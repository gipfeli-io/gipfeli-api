import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserDto } from '../../user/dto/user.dto';
import { MatchesOtherProperty } from '../../user/dto/validators/matches-other-property.decorator';
import { IsStrongPassword } from '../../user/dto/validators/is-strong-password.decorator';

export class TokenDto {
  accessToken: string;
  refreshToken: string;
}

export class PasswordResetRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class PasswordResetRequestCreatedDto {
  user: UserDto;
  token: string;
}

export class SetNewPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MatchesOtherProperty('passwordConfirmation', {
    message: 'Passwords do not match',
  })
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MatchesOtherProperty('password', {
    message: 'Passwords do not match',
  })
  passwordConfirmation: string;
}

/**
 * Note: This DTO is only used for better typing for Swagger, since the
 * passport-local strategy is hardcoded to use email and password seperately
 * (see jwt.strategy.ts).
 */
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
