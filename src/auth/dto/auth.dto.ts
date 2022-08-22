import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { UserDto, UserWithPasswordDto } from '../../user/dto/user.dto';
import { MatchesOtherProperty } from '../../user/dto/validators/matches-other-property.decorator';
import { IsStrongPassword } from '../../user/dto/validators/is-strong-password.decorator';
import { PickType } from '@nestjs/swagger';

/**
 * Contains both a user's access as well as refresh token.
 */
export class TokenDto {
  /**
   * JWT containing the access specifics.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGdpcGZlbGkuaW8iLCJzdWIiOiJiMTBmYjI1ZS0wMDJlLTQ2ZTItYWUzZC1jMTcxMzkzNGQyZGUiLCJyb2xlIjowLCJpYXQiOjE2NjExNTU3MjgsImV4cCI6MTY2MTE1NjMyOH0.pvv-H8r_dN28LCxtWsY9LP57yn1VkYe0dDg4aw1amOo'
   */
  accessToken: string;

  /**
   * JWT containing the refresh specifics.
   * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uSWQiOiI2ZDZjMGMxNS1iZjk5LTQwODUtOGY0Ny1jZmU1ZDAzN2MzY2YiLCJpYXQiOjE2NjExNTU3MjgsImV4cCI6MTY2Mzc0NzcyOH0.udBwTl71W62VyAj-FC9KtN7JQcnt-H5pPKzO1XYC_5c'
   */
  refreshToken: string;
}

export class PasswordResetRequestDto {
  /**
   * Must be a valid email address.
   * @example anne.thompson@gipfeli.io
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

/**
 * Internal DTO which can be used to pass a password reset request to a
 * notification provider for notifying the given user.
 */
export class PasswordResetRequestCreatedDto {
  @IsNotEmpty()
  user: UserDto;

  /**
   * The user's unhashed password reset token.
   * @example 16d07b8f478b11f563e2df3959f7b3a9c1038ac50e27b6e1cf
   */
  @IsNotEmpty()
  token: string;
}

export class SetNewPasswordDto {
  /**
   * Must be a valid UUID.
   * @example 08926b86-5f8e-48dc-9039-eb8206d8f529
   */
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  /**
   * The user's unhashed password reset token.
   * @example 16d07b8f478b11f563e2df3959f7b3a9c1038ac50e27b6e1cf
   */
  @IsString()
  @IsNotEmpty()
  token: string;

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
 * Note: This DTO is only used for better typing for Swagger, since the
 * passport-local strategy is hardcoded to use email and password seperately
 * (see jwt.strategy.ts).
 */
export class LoginDto extends PickType(UserWithPasswordDto, [
  'email',
  'password',
]) {}
