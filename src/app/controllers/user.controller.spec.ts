import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../core/services/user.service';
import { UserController } from './user.controller';
import { UserDto } from '../../core/dtos/userDto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../infrastructure/entities/user.entity';

const results: UserDto[] = [
  {
    id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
    firstname: 'Peter',
    lastname: 'Meier',
    username: 'peter@gipfeli.io',
    password: '1234',
    tours: [],
  },
  {
    id: '2bd0b79d-071a-4672-0804-027d97f98a6e',
    firstname: 'Sara',
    lastname: 'Müller',
    username: 'sara@gipfeli.io',
    password: '5678',
    tours: [],
  },
];

const userRepositoryMock = {
  find: jest.fn(() => Promise.resolve(results)),
};

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            findAll: jest.fn().mockResolvedValue(results),
          };
        }
      })
      .compile();

    userController = module.get<UserController>(UserController);
  });

  it('getUsers: should return a list of users', async () => {
    const controllerSpy = jest.spyOn(userController, 'getUsers');
    expect(await userController.getUsers()).toEqual(results);
    expect(controllerSpy).toHaveBeenCalledTimes(1);
  });
});
