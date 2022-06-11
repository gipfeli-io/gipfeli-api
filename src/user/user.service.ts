import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto, UserDto } from './dto/user';
import { UserAlreadyExists } from './user.exceptions';
import { HashService } from '../utils/hash.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async findAll(): Promise<UserDto[]> {
    return this.userRepository.find();
  }

  async findOne(email: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: [{ email: email }],
    });

    if (user) {
      return user;
    }

    throw new NotFoundException();
  }

  async create(createUserDto: CreateUserDto): Promise<void> {
    const { password, ...user } = createUserDto;
    const hashedPassword = await this.hashService.hash(password);
    const newUser = this.userRepository.create({
      password: hashedPassword,
      ...user,
    });

    try {
      await this.userRepository.save(newUser);
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
  }
}
