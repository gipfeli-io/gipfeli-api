import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import {
  UNIQUE_USER_EMAIL_CONSTRAINT,
  User,
  UserRole,
} from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import { CryptoService } from '../utils/crypto.service';
import { FindConditions, QueryFailedError, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserAlreadyExistsException } from './user.exceptions';
import { CreateUserDto } from './dto/user.dto';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { ConfigService } from '@nestjs/config';

const date = new Date();
const defaultUser: User = {
  id: '8a6e0804-2bd0-4672-b79d-d97027f9071a',
  firstName: 'Peter',
  lastName: 'Meier',
  email: 'peter@gipfeli.io',
  password: '1234',
  role: UserRole.USER,
  tours: [],
  createdAt: date,
  updatedAt: date,
  tokens: [],
  isActive: true,
  sessions: [],
  images: [],
  gpxFiles: [],
};
const createUserDto: CreateUserDto = {
  email: defaultUser.email,
  password: defaultUser.password,
  passwordConfirmation: defaultUser.password,
  lastName: defaultUser.lastName,
  firstName: defaultUser.firstName,
};

describe('UserService', () => {
  let userService: UserService;
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

    userService = module.get<UserService>(UserService);
    userRepositoryMock = module.get(getRepositoryToken(User));
    tokenRepositoryMock = module.get(getRepositoryToken(UserToken));
  });

  describe('findOne', () => {
    it('returns a user that is inactive', async () => {
      const whereMock = jest.fn().mockReturnThis();
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: whereMock,
          getOne: jest.fn().mockReturnValueOnce(defaultUser),
        };
      });

      const result = await userService.findOne(defaultUser.email);
      expect(result).toEqual(defaultUser);
      expect(whereMock).toHaveBeenCalledWith('user.email = :email', {
        email: defaultUser.email,
      });
    });

    it('raises NotFoundException if user is inactive and canBeInactive is not set', async () => {
      mockUser.isActive = false;
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const result = async () => userService.findOne(mockUser.email);

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

    it('raises NotFoundException if inactive user exists but canBeInactive is false', async () => {
      mockUser.isActive = false;
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(mockUser),
        };
      });

      const result = async () => userService.findOne(mockUser.email);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('raises NotFoundException if user does not exist', async () => {
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(null),
        };
      });
      const email = 'does-not-exist@gipfeli.io';

      const result = async () => userService.findOne(email);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneForAuthentication', () => {
    it('explicitly selects password', async () => {
      const addSelectMock = jest.fn().mockReturnThis();
      const whereMock = jest.fn().mockReturnThis();
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: whereMock,
          addSelect: addSelectMock,
          getOne: jest.fn().mockReturnValueOnce(defaultUser),
        };
      });

      const result = await userService.findOneForAuth(defaultUser.email);

      expect(whereMock).toHaveBeenCalledWith(
        'user.email = :email AND user.isActive = TRUE',
        { email: defaultUser.email },
      );
      expect(addSelectMock).toHaveBeenCalledWith('user.password');
      expect(result).toEqual(defaultUser);
    });

    it('raises NotFoundException if user does not exist', async () => {
      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          where: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(null),
        };
      });
      const email = 'does-not-exist@gipfeli.io';

      const result = async () => userService.findOneForAuth(email);

      await expect(result).rejects.toThrow(NotFoundException);
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

      const result = async () => userService.create(createUserDto);

      await expect(result).rejects.toThrow(UserAlreadyExistsException);
    });

    it('throws any other exception on save ', async () => {
      userRepositoryMock.save.mockImplementation(() => {
        throw new Error();
      });

      const result = async () => userService.create(createUserDto);

      await expect(result).rejects.toThrow(Error);
    });
  });

  describe('delete', () => {
    it('deletes an existing user and only if it is not an admin', async () => {
      const { id } = defaultUser;
      userRepositoryMock.delete.mockReturnValue({ affected: 1 });

      const result = await userService.remove(id);

      const expectedConditions: FindConditions<User> = {
        id: id,
        role: UserRole.USER,
      };
      expect(userRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(userRepositoryMock.delete).toHaveBeenCalledWith(
        expectedConditions,
      );
      // Service returns undefined currently
      expect(result).toEqual(undefined);
    });

    it('raises NotFoundException if trying to delete user that does not match selection', async () => {
      const { id } = defaultUser;
      userRepositoryMock.delete.mockReturnValue({ affected: 0 });

      const result = async () => userService.remove(id);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
