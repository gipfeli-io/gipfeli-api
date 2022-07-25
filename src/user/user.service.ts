import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto, UserCreatedDto, UserDto } from './dto/user';
import { UserAlreadyExistsException } from './user.exceptions';
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
}
