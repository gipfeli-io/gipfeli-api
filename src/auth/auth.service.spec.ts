import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../user/dto/user';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from '../utils/crypto.service';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { UserToken } from '../user/entities/user-token.entity';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { Repository } from 'typeorm';
import { UserSession } from './entities/user-session.entity';
import { RefreshedToken, UserIdentifier } from './types/auth';
import * as dayjs from 'dayjs';
import { ConfigService } from '@nestjs/config';

const defaultRefreshTokenValidity = 1000;
const defaultToken = 'insecure-jwt-token-used-for-testing-only';

const userConfig = {
  email: 'sara@gipfeli.io',
  unhashedPassword: 'this-is-my-secure-password',
};

const getUserDtoAndUserObject: (isActive: boolean) => [UserDto, User] = (
  isActive: boolean,
) => {
  const id = '2bd0b79d-071a-4672-0804-027d97f98a6e';
  const firstName = 'Sara';
  const lastName = 'Müller';
  const email = userConfig.email;
  const password = userConfig.unhashedPassword;
  return [
    { id, firstName, lastName, email, password },
    {
      id,
      firstName,
      lastName,
      email,
      password: bcrypt.hashSync(userConfig.unhashedPassword, 10),
      isActive: isActive,
    } as User,
  ];
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let sessionRepositoryMock: RepositoryMockType<Repository<UserSession>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: defaultToken,
          signOptions: { expiresIn: '3600s' },
        }),
      ],
      providers: [
        AuthService,
        UserService,
        CryptoService,
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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security.refreshTokenValidity') {
                return defaultRefreshTokenValidity;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    sessionRepositoryMock = module.get(getRepositoryToken(UserSession));
  });

  describe('validateUser', () => {
    it('should return a UserIdentifier matching the parameters email and password', async () => {
      const { unhashedPassword, email } = userConfig;
      const [_, user] = getUserDtoAndUserObject(true);
      jest
        .spyOn(userService, 'findOneForAuth')
        .mockReturnValue(Promise.resolve(user));
      const mockSession = 'x-x-x-x';
      sessionRepositoryMock.create.mockReturnValue(mockSession);

      const expected: UserIdentifier = {
        sub: user.id,
        email: user.email,
      };

      const result = await authService.validateUser(email, unhashedPassword);

      expect(result).toEqual(expected);
    });

    it('should return null when password does not match', async () => {
      const { email } = userConfig;
      const password = 'this-is-a-wrong-password';
      const [_, user] = getUserDtoAndUserObject(true);
      jest
        .spyOn(userService, 'findOneForAuth')
        .mockReturnValue(Promise.resolve(user));

      const result = await authService.validateUser(email, password);

      expect(result).toEqual(null);
    });

    it('throws NotFoundException if user and password do not match or do not exist and the user service throws the exception', async () => {
      // todo: is this test needed? the exception thrown is tested in userservice, and just rethrown here without catch?
      const email = 'peter@gipfeli.io';
      const password = '5678';
      jest.spyOn(userService, 'findOneForAuth').mockImplementation(() => {
        throw new NotFoundException();
      });

      const call = async () => await authService.validateUser(email, password);

      await expect(call).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSession', () => {
    it('creates a session and returns its value', async () => {
      const userId = 'x-y-z';
      const mockSession: UserSession = { id: 'session-id' } as UserSession;
      sessionRepositoryMock.create.mockReturnValue(mockSession);
      sessionRepositoryMock.save.mockReturnValue(mockSession);

      await expect(await authService.createSession(userId)).toEqual(
        mockSession.id,
      );
    });
  });

  describe('handleTokenRefresh', () => {
    it('updates a session if it exists and is still valid and returns refresh data', async () => {
      const mockSession: UserSession = {
        id: 'session-id',
        validFrom: dayjs().toISOString(),
        user: {
          id: 'x-x-x',
          email: 'x@x.ch',
        },
      } as UserSession;
      sessionRepositoryMock.findOne.mockReturnValue(mockSession);
      sessionRepositoryMock.save.mockReturnValue(mockSession);

      const result = await authService.handleTokenRefresh(mockSession.id);
      const expected: RefreshedToken = {
        sub: mockSession.user.id,
        email: mockSession.user.email,
        sessionId: mockSession.id,
      };

      expect(sessionRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(sessionRepositoryMock.save).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(expected);
    });

    it('returns undefined if no session exists', async () => {
      sessionRepositoryMock.findOne.mockReturnValue(null);

      const result = await authService.handleTokenRefresh('');

      expect(result).toEqual(undefined);
    });

    it('returns undefined if session validity is over and deletes the session', async () => {
      const mockSession: UserSession = {
        id: 'session-id',
        validFrom: dayjs().toISOString(),
        user: {
          id: 'x-x-x',
          email: 'x@x.ch',
        },
      } as UserSession;
      sessionRepositoryMock.findOne.mockReturnValue(mockSession);
      const fakeDate = dayjs().add(defaultRefreshTokenValidity, 'minutes');
      jest.useFakeTimers().setSystemTime(fakeDate.toDate());

      const result = await authService.handleTokenRefresh(mockSession.id);

      expect(sessionRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(sessionRepositoryMock.delete).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(undefined);
    });
  });
});
