import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../core/services/user.service';
import { UserController } from './user.controller';
import { UserDto } from '../../core/dtos/userDto';

describe('UserController', () => {
  let userService: UserService;
  let userController: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);
    userController = module.get<UserController>(UserController);
  });

  it('getUsers: should return a list of users', async () => {
    const userList: UserDto[] = [];
    userList.push({
      id: '1234455',
      firstname: 'firstName1',
      lastname: 'lastname1',
      username: 'test1@gipfeli.io',
      password: '123456',
    } as UserDto);

    jest.spyOn(userService, 'findAll').mockImplementation(async () => userList);
    expect(await userController.getUsers()).toBe(userList);
  });
});
