import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../../infrastructure/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../dtos/user';

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
    const userServiceSpy = jest.spyOn(service, 'findOne');
    const username = 'peter@gipfeli.io';
    expect(await service.findOne(username)).toEqual(userDto);
    expect(userServiceSpy).toHaveBeenCalledWith(username);
  });

  it('findAll: should return a list of users', async () => {
    const userServiceSpy = jest.spyOn(service, 'findAll');
    expect(await service.findAll()).toEqual([userDto]);
    expect(userServiceSpy).toHaveBeenCalledTimes(1);
  });
});
