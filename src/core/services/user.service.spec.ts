import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../../infrastructure/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../dtos/userDto';

const user: User = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstname: 'Peter',
  lastname: 'Meier',
  username: 'peter@gipfeli.io',
  password: '1234',
  tours: [],
};

const userDto: UserDto = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstname: 'Peter',
  lastname: 'Meier',
  username: 'peter@gipfeli.io',
  password: '1234',
  tours: [],
};

const userRepositoryMock = {
  findOne: jest.fn(() => Promise.resolve(user)),
  find: jest.fn(() => Promise.resolve([user])),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('findOne: should return a user', async () => {
    expect(await service.findOne('peter@gipfeli.io')).toEqual(userDto);
  });

  it('findAll: should return a list of users', async () => {
    expect(await service.findAll()).toEqual([userDto]);
  });
});
