import { OmitType, PickType } from '@nestjs/mapped-types';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../entities/user.entity';

// todo: rework our userdto to properly type it - the role and password are not used everywhere, etc.
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

  @IsEnum(UserRole)
  role: UserRole;
}

/**
 * This DTO is created by the @User decorator and consists of the user's ID and
 * email.
 */
export class AuthenticatedUserDto extends PickType(UserDto, [
  'id',
  'email',
  'role',
] as const) {}

export class CreateUserDto extends OmitType(UserDto, ['id', 'role'] as const) {}

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
