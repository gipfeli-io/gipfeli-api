import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory from '../utils/mock-utils/repository-mock.factory';
import { CryptoService } from '../utils/crypto.service';
import {
  ActivateUserDto,
  CreateUserDto,
  LogOutDto,
  UserDto,
} from '../user/dto/user.dto';
import { User, UserRole } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { UserToken } from '../user/entities/user-token.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
  TokenDto,
} from './dto/auth.dto';
import { JwtModule } from '@nestjs/jwt';
import * as httpMocks from 'node-mocks-http';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { UserSession } from './entities/user-session.entity';
import { RefreshedToken, UserIdentifier } from './types/auth';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';
import { UserAuthService } from '../user/user-auth.service';
import { randomUUID } from 'crypto';

const defaultToken = 'insecure-jwt-token-used-for-testing-only';

const notificationServiceMock = {
  sendSignUpMessage: jest.fn(),
  sendPasswordResetRequestMessage: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let userAuthService: UserAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [
        JwtModule.register({
          secret: defaultToken,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        UserAuthService,
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => {
              return 10;
            }),
          },
        },
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
    userAuthService = module.get<UserAuthService>(UserAuthService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('calls authService.createSession() with the user ID from the request', async () => {
      const mockReturn = Promise.resolve('');
      const mockUser: UserIdentifier = {
        sub: 'test',
        email: 'test@gipfeli.io',
        role: UserRole.USER,
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
        role: UserRole.USER,
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
        mockUser.role,
      );
    });
  });

  describe('logout', () => {
    it('calls userService.logout() with the body object', async () => {
      const mockReturn = Promise.resolve(undefined);
      const mockLogout = {
        sessionId: randomUUID(),
      } as LogOutDto;
      const spy = jest
        .spyOn(authService, 'deleteSession')
        .mockReturnValue(mockReturn);

      await authController.logout(mockLogout);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockLogout.sessionId);
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
        .spyOn(userAuthService, 'activateUser')
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

  describe('refreshToken', () => {
    it('calls authService.createTokenResponse() with the correct data from the request', async () => {
      const mockReturn = Promise.resolve<TokenDto>({
        refreshToken: 'xxx',
        accessToken: 'yyy',
      });
      const mockRefresh: RefreshedToken = {
        sub: 'test',
        email: 'test@gipfeli.io',
        sessionId: 'xxx',
        role: UserRole.USER,
      };
      const mockRequest = httpMocks.createRequest({
        user: mockRefresh,
      });

      const spy = jest
        .spyOn(authService, 'createTokenResponse')
        .mockReturnValue(mockReturn);

      await authController.refreshToken(mockRequest);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        mockRefresh.sub,
        mockRefresh.email,
        mockRefresh.sessionId,
        mockRefresh.role,
      );
    });
  });

  describe('passwordResetRequest', () => {
    it('calls userService to create a token and sends a message containing the token to the user', async () => {
      const mockRequest: PasswordResetRequestDto = { email: 'test@gipfeli.io' };
      const tokenMock = 'mocked-token';
      const userMock = mockRequest.email as unknown as UserDto;
      const mockTokenResponse: PasswordResetRequestCreatedDto = {
        token: tokenMock,
        user: userMock,
      };
      const userServiceSpy = jest
        .spyOn(userAuthService, 'createPasswordResetTokenForUser')
        .mockReturnValue(Promise.resolve(mockTokenResponse));
      const notificationServiceSpy = jest
        .spyOn(notificationServiceMock, 'sendPasswordResetRequestMessage')
        .mockReturnValue(Promise.resolve());

      await authController.passwordResetRequest(mockRequest);

      expect(userServiceSpy).toHaveBeenCalledWith(mockRequest);
      expect(notificationServiceSpy).toHaveBeenCalledWith(tokenMock, userMock);
    });

    it('fails gracefully if the user is not found and does not send a message', async () => {
      jest
        .spyOn(userAuthService, 'createPasswordResetTokenForUser')
        .mockImplementation(() => {
          throw new NotFoundException();
        });
      const email = 'does-not-exist@gipfeli.io';

      const result = async () => authController.passwordResetRequest({ email });

      expect(result).not.toThrow();
    });

    it('throws exceptions other than NotFoundError', async () => {
      jest
        .spyOn(userAuthService, 'createPasswordResetTokenForUser')
        .mockImplementation(() => {
          throw new Error();
        });
      const email = 'does-not-exist@gipfeli.io';

      const result = async () => authController.passwordResetRequest({ email });

      await expect(result).rejects.toThrow(Error);
    });
  });

  describe('passwordResetSet', () => {
    it('calls userService.resetPassword() with correct params', async () => {
      const serviceSpy = jest
        .spyOn(userAuthService, 'resetPassword')
        .mockReturnValue(Promise.resolve());
      const setNewPasswordDto: SetNewPasswordDto = {
        password: 'x-x-x',
        token: 'mock-token',
        userId: 'mock-user-id',
        passwordConfirmation: 'x-x-x',
      };

      await authController.passwordResetSet(setNewPasswordDto);

      expect(serviceSpy).toHaveBeenCalledWith(setNewPasswordDto);
    });
  });
});
