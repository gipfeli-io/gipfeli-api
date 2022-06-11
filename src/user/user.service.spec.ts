import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from './dto/user';
import { UserToken } from './entities/user-token.entity';
import { CryptoService } from '../utils/crypto.service';

const date = new Date()
const user: User = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstName: 'Peter',
  lastName: 'Meier',
  email: 'peter@gipfeli.io',
  password: '1234',
  tours: [],
  tokens: [],
  isActive: true,
  createdAt: date,
  updatedAt: date,
};

const userDto: UserDto = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstName: 'Peter',
  lastName: 'Meier',
  email: 'peter@gipfeli.io',
  password: '1234',
  tours: [],
};

const userRepositoryMock = {
  findOne: jest.fn(() => Promise.resolve(user)),
  find: jest.fn(() => Promise.resolve([user])),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        CryptoService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
        {
          provide: getRepositoryToken(UserToken),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  it('findOne: should return a user', async () => {
    const userServiceSpy = jest.spyOn(userService, 'findOne');
    const email = 'peter@gipfeli.io';
    expect(await userService.findOne(email)).toEqual(userDto);
    expect(userServiceSpy).toHaveBeenCalledWith(email);
  });

  it('findAll: should return a list of users', async () => {
    const userServiceSpy = jest.spyOn(userService, 'findAll');
    expect(await userService.findAll()).toEqual([userDto]);
    expect(userServiceSpy).toHaveBeenCalledTimes(1);
  });
});
