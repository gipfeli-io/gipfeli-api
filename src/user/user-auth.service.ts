import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { ActivateUserDto } from './dto/user';
import { CryptoService } from '../utils/crypto.service';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
} from '../auth/dto/auth';
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
   * Todo: Add token validity period with createdAt
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

      user.isActive = true;
      await this.userRepository.save(user);

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

      user.password = await this.cryptoService.hash(password);
      await this.userRepository.save(user);

      return Promise.resolve();
    }
    // The tokens do not match
    throw new BadRequestException();
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
          // todo: add integration test for this
          'user.tokens',
          'tokens',
          '"tokenType" = :tokenType AND tokens."createdAt" >= :validFrom',
          {
            tokenType: tokenType,
            validFrom: validFrom.toISOString(),
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
    const hasValidToken = await this.checkForValidToken(user.tokens, token);

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
