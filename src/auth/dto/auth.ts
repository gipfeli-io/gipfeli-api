import { IsEmail, IsNotEmpty } from 'class-validator';
import { UserDto } from '../../user/dto/user';

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
