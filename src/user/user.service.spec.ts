import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UNIQUE_USER_EMAIL_CONSTRAINT, User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import { CryptoService } from '../utils/crypto.service';
import { QueryFailedError, Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserAlreadyExistsException } from './user.exceptions';
import { ActivateUserDto, CreateUserDto } from './dto/user';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { ConfigService } from '@nestjs/config';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
} from '../auth/dto/auth';
import { RandomTokenContainer } from '../utils/types/random-token';

const date = new Date();
const defaultUser: User = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstName: 'Peter',
  lastName: 'Meier',
  email: 'peter@gipfeli.io',
  password: '1234',
  tours: [],
  createdAt: date,
  updatedAt: date,
  tokens: [],
  isActive: true,
  sessions: [],
  images: [],
};
const createUserDto: CreateUserDto = {
  email: defaultUser.email,
  password: defaultUser.password,
  lastName: defaultUser.lastName,
  firstName: defaultUser.firstName,
};

const tokenValue = 'x-x-x';

describe('UserService', () => {
  let userService: UserService;
  let cryptoService: CryptoService;
  let userRepositoryMock: RepositoryMockType<Repository<User>>;
  let tokenRepositoryMock: RepositoryMockType<Repository<UserToken>>;
  let mockUser: User;

  beforeEach(async () => {
    mockUser = Object.assign({}, defaultUser);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'security.noOfHashRounds') {
                return 10;
              }
              return null;
            }),
          },
        },
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(UserToken),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    cryptoService = module.get<CryptoService>(CryptoService);
    userService = module.get<UserService>(UserService);
    userRepositoryMock = module.get(getRepositoryToken(User));
    tokenRepositoryMock = module.get(getRepositoryToken(UserToken));
  });

  describe('findOne', () => {
    it('returns a user without password', async () => {
      const addSelectMock = jest.fn();
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          addSelect: addSelectMock,
          getOne: jest.fn().mockReturnValueOnce(defaultUser),
        };
      });

      const result = await userService.findOne(defaultUser.email);
      expect(result).toEqual(defaultUser);
      expect(addSelectMock).not.toHaveBeenCalled();
    });

    it('raises NotFoundException if user is inactive and canBeInactive is not set', async () => {
      mockUser.isActive = false;
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const result = async () => await userService.findOne(mockUser.email);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('returns user if is inactive if canBeInactive is set', async () => {
      mockUser.isActive = false;
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      expect(await userService.findOne(mockUser.email, true)).toEqual(mockUser);
    });

    it('adds password if exposePassword is true', async () => {
      const addSelectMock = jest.fn();
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          addSelect: addSelectMock,
          getOne: jest.fn().mockReturnValueOnce(defaultUser),
        };
      });

      await userService.findOne(defaultUser.email, false, true);

      expect(addSelectMock).toHaveBeenCalledTimes(1);
      expect(addSelectMock).toHaveBeenCalledWith('user.password');
    });

    it('raises NotFoundException if user does not exist', async () => {
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(null),
        };
      });
      const email = 'does-not-exist@gipfeli.io';

      const result = async () => await userService.findOne(email);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneForAuthentication', () => {
    it('calls findOne() with correct params to choose active users only and expose the password', async () => {
      const findOneSpy = jest
        .spyOn(userService, 'findOne')
        .mockReturnValue(Promise.resolve(defaultUser));
      const { email } = defaultUser;

      await userService.findOneForAuth(email);

      expect(findOneSpy).toHaveBeenCalledWith(email, false, true);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const userServiceSpy = jest.spyOn(userService, 'findAll');
      const users = [defaultUser, defaultUser];
      userRepositoryMock.find.mockReturnValue(users);

      expect(await userService.findAll()).toEqual(users);
      expect(userServiceSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('creates a user with the specified params and a hashed password', async () => {
      const userServiceSpy = jest.spyOn(userService, 'create');
      userRepositoryMock.create.mockReturnValue(defaultUser);

      await userService.create(createUserDto);

      expect(userServiceSpy).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          password: expect.any(String),
        }),
      );
      expect(userRepositoryMock.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          password: createUserDto.password,
        }),
      );
      expect(userRepositoryMock.save).toHaveBeenCalledWith(defaultUser);
    });

    it('creates an activation token for a new user', async () => {
      userRepositoryMock.create.mockReturnValue(defaultUser);

      await userService.create(createUserDto);

      // todo: check why test calls this with user object?
      expect(tokenRepositoryMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        }),
      );
      expect(tokenRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: defaultUser,
        }),
      );
    });

    it('throws UserAlreadyExists if email is already saved', async () => {
      userRepositoryMock.save.mockImplementation(() => {
        throw new QueryFailedError('dummy', [], {
          constraint: UNIQUE_USER_EMAIL_CONSTRAINT,
        });
      });

      const result = async () => await userService.create(createUserDto);

      await expect(result).rejects.toThrow(UserAlreadyExistsException);
    });

    it('throws any other exception on save ', async () => {
      userRepositoryMock.save.mockImplementation(() => {
        throw new Error();
      });

      const result = async () => await userService.create(createUserDto);

      await expect(result).rejects.toThrow(Error);
    });
  });

  describe('activateUser', () => {
    it('activates a user and deletes the tokens', async () => {
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        user: mockUser,
      } as UserToken;

      mockUser.isActive = false;
      mockUser.tokens = [token];

      const activateUserDto: ActivateUserDto = {
        token: tokenValue,
        userId: mockUser.id,
      };

      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      await userService.activateUser(activateUserDto);

      expect(tokenRepositoryMock.delete).toHaveBeenCalledWith({
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        userId: mockUser.id,
      });
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('throws an exception if the token does not match', async () => {
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        user: mockUser,
      } as UserToken;

      mockUser.isActive = false;
      mockUser.tokens = [token];

      const activateUserDto: ActivateUserDto = {
        token: 'wrong-token',
        userId: mockUser.id,
      };

      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const result = async () =>
        await userService.activateUser(activateUserDto);

      await expect(result).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPasswordResetTokenForUser', () => {
    it('throws NotFoundException if user does not exist', async () => {
      const user: PasswordResetRequestDto = { email: 'test@gipfeli.io' };
      userRepositoryMock.findOne.mockReturnValue(null);

      const result = async () =>
        await userService.createPasswordResetTokenForUser(user);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('finds a user, creates a token for them and returns the user and its token', async () => {
      const user: PasswordResetRequestDto = { email: defaultUser.email };
      const tokenContainerMock: RandomTokenContainer = {
        token: 'mocked-token',
        tokenHash: 'hashed-token',
      };
      jest
        .spyOn(cryptoService, 'getRandomTokenWithHash')
        .mockReturnValue(Promise.resolve(tokenContainerMock));
      userRepositoryMock.findOne.mockReturnValue(defaultUser);

      const result = await userService.createPasswordResetTokenForUser(user);

      const expectedResult: PasswordResetRequestCreatedDto = {
        user: defaultUser,
        token: tokenContainerMock.token,
      };
      expect(result).toEqual(expectedResult);
      expect(tokenRepositoryMock.create).toHaveBeenCalledWith({
        user: defaultUser,
        token: tokenContainerMock.tokenHash,
        tokenType: UserTokenType.PASSWORD_RESET,
      });
      expect(tokenRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          user: defaultUser,
          token: tokenContainerMock.tokenHash,
          tokenType: UserTokenType.PASSWORD_RESET,
        }),
      );
    });
  });

  describe('resetPassword', () => {
    it('sets a user password and deletes the tokens', async () => {
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.PASSWORD_RESET,
        user: mockUser,
      } as UserToken;
      mockUser.tokens = [token];
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const newPassword = 'new-password';
      const setNewPasswordDto: SetNewPasswordDto = {
        token: tokenValue,
        userId: mockUser.id,
        password: newPassword,
      };

      const mockHash = 'hashed-pw';
      const cryptoSpy = jest
        .spyOn(cryptoService, 'hash')
        .mockReturnValue(Promise.resolve('hashed-pw'));

      await userService.resetPassword(setNewPasswordDto);

      expect(tokenRepositoryMock.delete).toHaveBeenCalledWith({
        tokenType: UserTokenType.PASSWORD_RESET,
        userId: mockUser.id,
      });
      expect(userRepositoryMock.save).toHaveBeenCalled();
      expect(cryptoSpy).toHaveBeenCalledWith(newPassword);
      expect(userRepositoryMock.save.mock.calls[0][0]).toEqual(
        expect.objectContaining({ password: mockHash }),
      );
    });

    it('throws an exception if the token does not match', async () => {
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.PASSWORD_RESET,
        user: mockUser,
      } as UserToken;
      mockUser.tokens = [token];
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const newPassword = 'new-password';
      const setNewPasswordDto: SetNewPasswordDto = {
        token: 'wrong-token',
        userId: mockUser.id,
        password: newPassword,
      };

      const result = async () =>
        await userService.resetPassword(setNewPasswordDto);

      await expect(result).rejects.toThrow(BadRequestException);
    });
  });
});
