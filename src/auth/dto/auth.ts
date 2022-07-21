import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
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

export class SetNewPasswordDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
