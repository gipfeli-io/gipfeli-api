import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserDto } from '../../user/dto/user';
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
