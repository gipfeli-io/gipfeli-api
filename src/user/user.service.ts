import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UNIQUE_USER_EMAIL_CONSTRAINT,
  User,
  UserRole,
} from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import {
  CreateUserDto,
  UserCreatedDto,
  UserDto,
  UserWithPasswordDto,
} from './dto/user';
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
   * Looks for an active user by email and returns the object with password.
   *
   * @param email
   */
  async findOneForAuth(email: string): Promise<UserWithPasswordDto> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email AND user.isActive = TRUE', { email })
      .addSelect('user.password');

    const user = await qb.getOne();

    if (user) {
      return user;
    }

    throw new NotFoundException();
  }

  /**
   * Returns on user or throws a NotFoundException. If canBeInactive is set, it
   * also returns a user that has not activated their account yet. Defaults to
   * false so we always scope this to the active users only and throw a
   * UserNotActivatedException.
   *
   * @param email
   * @param canBeInactive
   */
  async findOne(email: string, canBeInactive = false): Promise<UserDto> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

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

    // todo: we rely on class-transformer to throw if "role" is in the payload - should we specify fields here explicitly?
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

  async remove(id: string): Promise<void> {
    // Currently, we only allow non-admins to be deleted.
    const deleteResult = await this.userRepository.delete({
      id,
      role: UserRole.USER,
    });

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
