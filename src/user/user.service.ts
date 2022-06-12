import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { ActivateUserDto, CreateUserDto, UserDto } from './dto/user';
import { UserAlreadyExists, UserNotActivated } from './user.exceptions';
import { CryptoService } from '../utils/crypto.service';
import { UserToken, UserTokenType } from './entities/user-token.entity';

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
   * Returns on user or throws a NotFoundException. If canBeInactive is set, it
   * also returns a user that has not activated their account yet. Defaults to
   * false so we always scope this to the active users only and throw a
   * UserNotActivatedException.
   * @param email
   * @param canBeInactive
   */
  async findOne(email: string, canBeInactive = false): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: [{ email: email }],
    });

    if (user) {
      if (!canBeInactive && !user.isActive) {
        throw new UserNotActivated();
      }

      return user;
    }

    throw new NotFoundException();
  }

  /**
   * Creates a new user and assigns it an activation token.
   * @param createUserDto
   */
  async create(createUserDto: CreateUserDto): Promise<void> {
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
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.driverError.constraint === UNIQUE_USER_EMAIL_CONSTRAINT
      ) {
        throw new UserAlreadyExists();
      } else {
        throw e;
      }
    }

    // Todo: Dispatch email
    console.log(token);
    console.log(newUser.id);
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

    const user = await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.tokens', 'tokens', '"tokenType" = :tokenType', {
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      })
      .where({ id: userId, isActive: false })
      .getOneOrFail();

    const hasValidToken = await this.checkForValidToken(user.tokens, token);

    if (hasValidToken) {
      await this.tokenRepository.delete({
        userId,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      user.isActive = true;
      await this.userRepository.save(user);

      return Promise.resolve(undefined);
    }
    // The tokens do not match
    throw new BadRequestException();
  }

  /**
   * Checks whether a given token matches a token in a list of hashed tokens.
   * @param tokens
   * @param token
   * @private
   */
  private async checkForValidToken(tokens: UserToken[], token: string) {
    let hasValidToken = false;
    for (let i = 0; i < tokens.length; i++) {
      const check = await this.cryptoService.compare(token, tokens[i].token);
      if (check) {
        hasValidToken = true;
      }
    }
    return hasValidToken;
  }
}
