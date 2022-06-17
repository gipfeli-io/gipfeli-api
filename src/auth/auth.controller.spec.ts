import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory from '../utils/mock-utils/repository-mock.factory';
import { CryptoService } from '../utils/crypto.service';
import { ActivateUserDto, CreateUserDto } from '../user/dto/user';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserToken } from '../user/entities/user-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenDto } from './dto/auth';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
import * as httpMocks from 'node-mocks-http';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { UserSession } from './entities/user-session.entity';
import { UserIdentifier } from './types/auth';

const notificationServiceMock = {
  sendSignUpMessage: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    process.env.AUTH_TOKEN_VALIDITY = '10';
    process.env.REFRESH_TOKEN_VALIDITY = '10';
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        JwtModule.register({
          secret: jwtConstants.secret,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        CryptoService,
        {
          provide: NotificationServiceInterface,
          useValue: notificationServiceMock,
        },
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

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('calls authService.createSession() with the user ID from the request', async () => {
      const mockReturn = Promise.resolve('');
      const mockUser: UserIdentifier = {
        sub: 'test',
        email: 'test@gipfeli.io',
      };
      const mockRequest = httpMocks.createRequest({
        user: mockUser,
      });

      const spy = jest
        .spyOn(authService, 'createSession')
        .mockReturnValue(mockReturn);

      await authController.login(mockRequest);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockUser.sub);
    });

    it('calls authService.login() with the correct params', async () => {
      const mockReturn = Promise.resolve({} as TokenDto);
      const mockUser: UserIdentifier = {
        sub: 'test',
        email: 'test@gipfeli.io',
      };
      const mockSession = 'x-x-x-x';
      const mockRequest = httpMocks.createRequest({
        user: mockUser,
      });

      authService.createSession = jest.fn().mockReturnValue(mockSession);

      const spy = jest
        .spyOn(authService, 'createTokenResponse')
        .mockReturnValue(mockReturn);

      await authController.login(mockRequest);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        mockUser.sub,
        mockUser.email,
        mockSession,
      );
    });
  });

  describe('activateUser', () => {
    it('calls userService.activateUser() with the body object', async () => {
      const mockReturn = Promise.resolve(undefined);
      const mockUser = {
        userId: 'x',
        token: 'y',
      } as ActivateUserDto;
      const spy = jest
        .spyOn(userService, 'activateUser')
        .mockReturnValue(mockReturn);

      await authController.activateUser(mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signUp', () => {
    it('calls userservice.create() with the body object', async () => {
      const mockUser = {
        email: 'x',
        lastName: 'x',
        firstName: 'y',
        password: 'a',
      } as CreateUserDto;
      const spy = jest.spyOn(userService, 'create');

      await authController.signUp(mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockUser);
    });

    it('calls notificationService to send a signUp message with the returned values from user creation', async () => {
      const mockReturn = { token: 'x', user: 'y' };
      const mockUser = {
        email: 'x',
        lastName: 'x',
        firstName: 'y',
        password: 'a',
      } as CreateUserDto;
      userService.create = jest.fn().mockReturnValue(mockReturn);
      const spy = jest.spyOn(notificationServiceMock, 'sendSignUpMessage');

      await authController.signUp(mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toEqual(mockReturn.token);
      expect(spy.mock.calls[0][1]).toEqual(mockReturn.user);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });
  });
});
