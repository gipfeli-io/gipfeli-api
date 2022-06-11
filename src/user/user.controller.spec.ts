import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDto } from './dto/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

const results: UserDto[] = [
  {
    id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
    firstName: 'Peter',
    lastName: 'Meier',
    email: 'peter@gipfeli.io',
    password: '1234',
    tours: [],
  },
  {
    id: '2bd0b79d-071a-4672-0804-027d97f98a6e',
    firstName: 'Sara',
    lastName: 'Müller',
    email: 'sara@gipfeli.io',
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
