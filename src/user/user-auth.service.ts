import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { ActivateUserDto } from './dto/user.dto';
import { CryptoService } from '../utils/crypto.service';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
} from '../auth/dto/auth.dto';
import * as dayjs from 'dayjs';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly tokenRepository: Repository<UserToken>,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Tries to activate a user by retrieving a token for the user. Since a user
   * might have (in theory) several activation tokens (e.g. by requesting new
   * tokens), they all need to be checked for validity.
   *
   * Currently, the activation token is valid forever - this could be changed in
   * the future (as with the reset password token).
   *
   * @param activateUserDto
   */
  async activateUser(activateUserDto: ActivateUserDto): Promise<void> {
    const { userId, token } = activateUserDto;

    const { hasValidToken, user } = await this.checkForTokenMatchesWithUser(
      UserTokenType.ACCOUNT_ACTIVATION,
      token,
      userId,
    );

    if (hasValidToken) {
      await this.tokenRepository.delete({
        userId,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      await this.userRepository.update({ id: user.id }, { isActive: true });

      return Promise.resolve();
    }
    // The tokens do not match
    throw new BadRequestException();
  }

  /**
   * Creates a password request token if the given user exists or throws a
   * NotFoundException
   *
   * @param passwordResetRequestDto
   */
  async createPasswordResetTokenForUser(
    passwordResetRequestDto: PasswordResetRequestDto,
  ): Promise<PasswordResetRequestCreatedDto> {
    const { email } = passwordResetRequestDto;
    const user = await this.userRepository.findOne({
      where: [{ email: email }],
    });

    if (!user) {
      throw new NotFoundException();
    }

    const { token, tokenHash } =
      await this.cryptoService.getRandomTokenWithHash();
    const resetToken = this.tokenRepository.create({
      user: user,
      token: tokenHash,
      tokenType: UserTokenType.PASSWORD_RESET,
    });
    await this.tokenRepository.save(resetToken);

    return { user, token };
  }

  async resetPassword(setNewPasswordDto: SetNewPasswordDto): Promise<void> {
    const { userId, password, token } = setNewPasswordDto;

    const { hasValidToken, user } = await this.checkForTokenMatchesWithUser(
      UserTokenType.PASSWORD_RESET,
      token,
      userId,
      true,
      dayjs().subtract(2, 'h'), // validity period is 2 hours
    );

    if (hasValidToken) {
      await this.tokenRepository.delete({
        userId,
        tokenType: UserTokenType.PASSWORD_RESET,
      });

      const hashedPassword = await this.cryptoService.hash(password);
      await this.userRepository.update(
        { id: user.id },
        { password: hashedPassword },
      );

      return Promise.resolve();
    }
    // The tokens do not match
    throw new BadRequestException();
  }

  /**
   * Checks whether a supplied email address matches a user that is an
   * administrator. This can be used to ensure that the supplied token's role is
   * still mirrored in the DB. If an access token signals that a user is an
   * administrator, it might be that in the meantime, their admin rights have
   * been revoked. In this case, this method will return false.
   *
   * @param email
   */
  async isUserAdministrator(email: string): Promise<boolean> {
    try {
      await this.userRepository.findOneOrFail({
        where: [{ email, role: UserRole.ADMINISTRATOR }],
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks whether a given user and a supplied token exist in the database.
   * Optionally takes a dayjs object which can be used to limit a token's
   * validity period.
   * Returns the result of the comparison and the user entity.
   * @param tokenType
   * @param token
   * @param userId
   * @param isActive
   * @param validFrom
   * @private
   */
  private async checkForTokenMatchesWithUser(
    tokenType: UserTokenType,
    token: string,
    userId: string,
    isActive = false,
    validFrom = dayjs(new Date(1970, 1, 1)),
  ): Promise<{ hasValidToken: boolean; user: User }> {
    let user;
    try {
      user = await this.userRepository
        .createQueryBuilder('user')
        .innerJoinAndSelect(
          'user.tokens',
          'tokens',
          '"tokenType" = :tokenType',
          {
            tokenType: tokenType,
          },
        )
        .where({ id: userId, isActive })
        .getOneOrFail();
    } catch (e) {
      if (e instanceof EntityNotFoundError) {
        throw new BadRequestException();
      }

      // At this point, something bad happened, so we raise the actual error
      throw e;
    }

    // We filter the validity here (and not in the SQL above) because TypeORM
    // handles createdAt columns without timestamps, so executing a raw query
    // with a date comparison will not handle the timezones properly.
    const tokens = user.tokens.filter((token) => token.createdAt > validFrom);
    const hasValidToken = await this.checkForValidToken(tokens, token);

    return { hasValidToken, user };
  }

  /**
   * Checks whether a given token matches a token in a list of hashed tokens.
   * @param tokens
   * @param token
   * @private
   */
  private async checkForValidToken(tokens: UserToken[], token: string) {
    let hasValidToken = false;
    for (const element of tokens) {
      const check = await this.cryptoService.compare(token, element.token);
      if (check) {
        hasValidToken = true;
      }
    }

    return hasValidToken;
  }
}
