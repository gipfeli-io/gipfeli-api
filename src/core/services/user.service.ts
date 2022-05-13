import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';
import { Repository } from 'typeorm';
import { UserDto } from '../dtos/userDto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<UserDto[]> {
    return this.userRepository.find();
  }

  async findOne(username: string): Promise<UserDto> {
    return this.userRepository.findOne({ where: [{ username: username }] });
  }
}
