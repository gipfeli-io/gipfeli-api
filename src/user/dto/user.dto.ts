import { OmitType, PickType } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsInstance,
  IsNotEmpty,
  IsString,
  IsUUID,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { MatchesOtherProperty } from './validators/matches-other-property.decorator';
import { IsStrongPassword } from './validators/is-strong-password.decorator';
import { IsUUIDApiProperty } from '../../utils/decorators/custom-api-propertes.decorator';

export class UserDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  id: string;

  /**
   * @example Anne
   */
  @IsString()
  @IsNotEmpty()
  firstName: string;

  /**
   * @example Thompson
   */
  @IsString()
  @IsNotEmpty()
  lastName: string;

  /**
   * Must be a valid email address.
   * @example anne.thompson@gipfeli.io
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * @example USER
   */
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
  /**
   * @example gIpfeli!@weSome
   */
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
  /**
   * Must contain at least 1 uppercase, 1 lowercase and 1 of !@#$%^&*()-_+.; and at least 8 characters long.
   * @example gIpfeli!@weSome
   */
  @IsString()
  @IsNotEmpty()
  @MatchesOtherProperty('passwordConfirmation', {
    message: 'Passwords do not match',
  })
  @IsStrongPassword()
  password: string;

  /**
   * Must match the string given in the 'password' property.
   * @example gIpfeli!@weSome
   */
  @IsString()
  @IsNotEmpty()
  @MatchesOtherProperty('password', {
    message: 'Passwords do not match',
  })
  passwordConfirmation: string;
}

/**
 * Internally used DTO for transporting the newly created user with its
 * activation token to other services.
 */
export class UserCreatedDto {
  /**
   * The newly created user object.
   */
  @IsNotEmpty()
  @IsInstance(UserDto)
  user: UserDto;

  /**
   * The user's unhashed activation token.
   * @example 16d07b8f478b11f563e2df3959f7b3a9c1038ac50e27b6e1cf
   */
  @IsNotEmpty()
  token: string;
}

export class ActivateUserDto {
  @IsUUIDApiProperty()
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  /**
   * Unhashed activation token.
   * @example 16d07b8f478b11f563e2df3959f7b3a9c1038ac50e27b6e1cf
   */
  @IsString()
  @IsNotEmpty()
  token: string;
}
