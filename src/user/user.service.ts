import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto, UserDto } from './dto/user';
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
    private readonly hashService: CryptoService,
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
    const hashedPassword = await this.hashService.hash(password);
    const { token, tokenHash } =
      await this.hashService.getRandomTokenWithHash();

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
  }
}
