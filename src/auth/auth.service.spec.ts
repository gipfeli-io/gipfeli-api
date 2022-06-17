import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../user/dto/user';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
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
  let service: AuthService;
  let userRepositoryMock: RepositoryMockType<Repository<User>>;
  let sessionRepositoryMock: RepositoryMockType<Repository<UserSession>>;
  const env = process.env;

  beforeEach(async () => {
    jest.resetModules();
    process.env = { ...env };

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<AuthService>(AuthService);
    userRepositoryMock = module.get(getRepositoryToken(User));
    sessionRepositoryMock = module.get(getRepositoryToken(UserSession));
  });

  describe('validateUser', () => {
    it('should return a UserIdentifier matching the parameters email and password', async () => {
      const { unhashedPassword, email } = userConfig;
      const [_, user] = getUserDtoAndUserObject(true);
      const mockSession = 'x-x-x-x';
      userRepositoryMock.findOne.mockReturnValue(user);
      sessionRepositoryMock.create.mockReturnValue(mockSession);

      const expected: UserIdentifier = {
        sub: user.id,
        email: user.email,
      };

      expect(await service.validateUser(email, unhashedPassword)).toEqual(
        expected,
      );
    });

    it('should return null when password does not match', async () => {
      const { email } = userConfig;
      const password = 'this-is-a-wrong-password';
      const [_, user] = getUserDtoAndUserObject(true);
      userRepositoryMock.findOne.mockReturnValue(user);

      expect(await service.validateUser(email, password)).toEqual(null);
    });

    it('throws NotFoundException if user and password do not match or do not exist', async () => {
      const email = 'peter@gipfeli.io';
      const password = '5678';
      userRepositoryMock.findOne.mockReturnValue(null);

      const call = async () => await service.validateUser(email, password);

      await expect(call).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSession', () => {
    it('creates a session and returns its value', async () => {
      const userId = 'x-y-z';
      const mockSession: UserSession = { id: 'session-id' } as UserSession;
      sessionRepositoryMock.create.mockReturnValue(mockSession);
      sessionRepositoryMock.save.mockReturnValue(mockSession);

      await expect(await service.createSession(userId)).toEqual(mockSession.id);
    });
  });

  describe('handleTokenRefresh', () => {
    it('updates a session if it exists and is still valid and returns refresh data', async () => {
      process.env.REFRESH_TOKEN_VALIDITY = '1000';
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

      const result = await service.handleTokenRefresh(mockSession.id);
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

      const result = await service.handleTokenRefresh('');

      expect(result).toEqual(undefined);
    });

    it('returns undefined if session validity is over and deletes the session', async () => {
      process.env.REFRESH_TOKEN_VALIDITY = '-1';
      const mockSession: UserSession = {
        id: 'session-id',
        validFrom: dayjs().toISOString(),
        user: {
          id: 'x-x-x',
          email: 'x@x.ch',
        },
      } as UserSession;
      sessionRepositoryMock.findOne.mockReturnValue(mockSession);

      const result = await service.handleTokenRefresh(mockSession.id);

      expect(sessionRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(sessionRepositoryMock.delete).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(undefined);
    });
  });

  afterEach(() => {
    process.env = env;
  });
});
