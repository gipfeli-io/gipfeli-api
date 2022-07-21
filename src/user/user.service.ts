import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import {
  EntityNotFoundError,
  MoreThanOrEqual,
  QueryFailedError,
  Repository,
} from 'typeorm';
import {
  ActivateUserDto,
  CreateUserDto,
  UserCreatedDto,
  UserDto,
} from './dto/user';
import { UserAlreadyExistsException } from './user.exceptions';
import { CryptoService } from '../utils/crypto.service';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
} from '../auth/dto/auth';
import * as dayjs from 'dayjs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserToken)
    private readonly tokenRepository: Repository<UserToken>,
    private readonly cryptoService: CryptoService,
  ) {}

  async findAll(): Promise<UserDto[]> {
    return this.userRepository.find();
  }

  /**
   * Convenience method for calling findOne() with the correct params to also
   * expose the password. Only works for active users.
   *
   * @param email
   */
  async findOneForAuth(email: string): Promise<UserDto> {
    return this.findOne(email, false, true);
  }

  /**
   * Returns on user or throws a NotFoundException. If canBeInactive is set, it
   * also returns a user that has not activated their account yet. Defaults to
   * false so we always scope this to the active users only and throw a
   * UserNotActivatedException.
   *
   * If exposePassword is set to true, it will explicitly select the password
   * and add it to the User object.
   *
   * @param email
   * @param canBeInactive
   * @param exposePassword
   */
  async findOne(
    email: string,
    canBeInactive = false,
    exposePassword = false,
  ): Promise<UserDto> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });
    if (exposePassword) {
      qb.addSelect('user.password');
    }

    const user = await qb.getOne();

    if (user) {
      if (!canBeInactive && !user.isActive) {
        /*
         Security-wise, we also throw a NotFoundException to not expose that
         this user exists.
        */
        throw new NotFoundException();
      }

      return user;
    }

    throw new NotFoundException();
  }

  /**
   * Creates a new user and assigns it an activation token.
   * @param createUserDto
   */
  async create(createUserDto: CreateUserDto): Promise<UserCreatedDto> {
    const { password, ...user } = createUserDto;
    const hashedPassword = await this.cryptoService.hash(password);
    const { token, tokenHash } =
      await this.cryptoService.getRandomTokenWithHash();

    const newUser = this.userRepository.create({
      password: hashedPassword,
      ...user,
    });
    const newUserToken = this.tokenRepository.create({
      token: tokenHash,
      tokenType: UserTokenType.ACCOUNT_ACTIVATION,
    });

    try {
      // Todo: Wrap this in transaction?
      const savedUser = await this.userRepository.save(newUser);
      newUserToken.user = savedUser;
      await this.tokenRepository.save(newUserToken);

      return {
        user: savedUser,
        token: token,
      };
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.driverError.constraint === UNIQUE_USER_EMAIL_CONSTRAINT
      ) {
        throw new UserAlreadyExistsException();
      } else {
        throw e;
      }
    }
  }

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
   * Optionally takes a Date object which can be used to limit a token's
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
