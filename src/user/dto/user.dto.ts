import { OmitType, PickType } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { MatchesOtherProperty } from './validators/matches-other-property.decorator';
import { IsStrongPassword } from './validators/is-strong-password.decorator';

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

  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

/**
 * Used in auth checks, contains email, id, role and password.
 */
export class UserWithPasswordDto extends PickType(UserDto, [
  'id',
  'email',
  'role',
]) {
  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * This DTO is created by the @User decorator and consists of the user's ID and
 * email and role.
 */
export class AuthenticatedUserDto extends PickType(UserWithPasswordDto, [
  'id',
  'email',
  'role',
] as const) {}

export class CreateUserDto extends OmitType(UserDto, ['id', 'role'] as const) {
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