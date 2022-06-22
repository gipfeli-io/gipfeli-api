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
import {ConfigService} from "@nestjs/config";

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
};
const createUserDto: CreateUserDto = {
  email: defaultUser.email,
  password: defaultUser.password,
  lastName: defaultUser.lastName,
  firstName: defaultUser.firstName,
};

describe('UserService', () => {
  let userService: UserService;
  let cryptoService: CryptoService;
  let userRepositoryMock: RepositoryMockType<Repository<User>>;
  let tokenRepositoryMock: RepositoryMockType<Repository<UserToken>>;

  beforeEach(async () => {
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
    it('returns a user', async () => {
      const userServiceSpy = jest.spyOn(userService, 'findOne');
      userRepositoryMock.findOne.mockReturnValue(defaultUser);
      const email = 'peter@gipfeli.io';

      expect(await userService.findOne(email)).toEqual(defaultUser);
      expect(userServiceSpy).toHaveBeenCalledWith(email);
    });

    it('raises NotFoundException if user is inactive', async () => {
      const user = Object.assign({}, defaultUser);
      user.isActive = false;
      userRepositoryMock.findOne.mockReturnValue(user);
      const email = 'peter@gipfeli.io';

      const result = async () => await userService.findOne(email);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('raises NotFoundException if user does not exist', async () => {
      userRepositoryMock.findOne.mockReturnValue(null);
      const email = 'peter@gipfeli.io';

      const result = async () => await userService.findOne(email);

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
      const newUser = Object.assign({}, defaultUser);
      const tokenValue = 'xxx';
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        user: newUser,
      } as UserToken;

      newUser.isActive = false;
      newUser.tokens = [token];

      const activateUserDto: ActivateUserDto = {
        token: tokenValue,
        userId: newUser.id,
      };

      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(newUser),
        };
      });

      await userService.activateUser(activateUserDto);

      expect(tokenRepositoryMock.delete).toHaveBeenCalledWith({
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        userId: newUser.id,
      });
      expect(userRepositoryMock.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });
    it('throws an exception if the token does not match', async () => {
      const newUser = Object.assign({}, defaultUser);
      const tokenValue = 'xxx';
      const token = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        user: newUser,
      } as UserToken;

      newUser.isActive = false;
      newUser.tokens = [token];

      const activateUserDto: ActivateUserDto = {
        token: 'wrong-token',
        userId: newUser.id,
      };

      userRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          innerJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getOneOrFail: jest.fn().mockReturnValueOnce(newUser),
        };
      });

      const result = async () =>
        await userService.activateUser(activateUserDto);

      await expect(result).rejects.toThrow(BadRequestException);
    });
  });
});
