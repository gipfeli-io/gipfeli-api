import { OmitType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class UserDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * This DTO is create by the @User decorator and consists of the
 */
export class AuthenticatedUserDto extends PickType(UserDto, [
  'id',
  'email',
] as const) {}

export class CreateUserDto extends OmitType(UserDto, ['id'] as const) {}

export class UserCreatedDto {
  user: UserDto;
  token: string;
}

export class ActivateUserDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}
