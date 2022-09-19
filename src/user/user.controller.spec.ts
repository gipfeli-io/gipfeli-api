import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserDto } from './dto/user.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import repositoryMockFactory from '../utils/mock-utils/repository-mock.factory';
import { UserToken } from './entities/user-token.entity';
import { CryptoService } from '../utils/crypto.service';
import { ConfigService } from '@nestjs/config';
import { UserAuthService } from './user-auth.service';
import { AuthService } from '../auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserSession } from '../auth/entities/user-session.entity';

const results: UserDto[] = [
  {
    id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
    firstName: 'Peter',
    lastName: 'Meier',
    email: 'peter@gipfeli.io',
    role: UserRole.USER,
  },
  {
    id: '2bd0b79d-071a-4672-0804-027d97f98a6e',
    firstName: 'Sara',
    lastName: 'Müller',
    email: 'sara@gipfeli.io',
    role: UserRole.USER,
  },
] as UserDto[];

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'x-x-x',
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      controllers: [UserController],
      providers: [
        UserService,
        CryptoService,
        ConfigService,
        AuthService,
        UserAuthService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(UserToken),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(UserSession),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('calls userService.findAll() and returns a list of users', async () => {
      const spy = jest.spyOn(userService, 'findAll').mockResolvedValue(results);

      const result = await userController.findAll();

      expect(result).toEqual(results);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () =>
    it('calls userService.remove() with the correct params and returns void', async () => {
      const mockId = 'x-x-x';
      const spy = jest
        .spyOn(userService, 'remove')
        .mockResolvedValue(undefined);

      const result = await userController.remove(mockId);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(undefined);
    }));
});
