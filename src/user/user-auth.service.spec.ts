import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserToken, UserTokenType } from './entities/user-token.entity';
import { CryptoService } from '../utils/crypto.service';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ActivateUserDto } from './dto/user.dto';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { ConfigService } from '@nestjs/config';
import {
  PasswordResetRequestCreatedDto,
  PasswordResetRequestDto,
  SetNewPasswordDto,
} from '../auth/dto/auth.dto';
import { RandomTokenContainer } from '../utils/types/random-token';
import { UserAuthService } from './user-auth.service';

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

const tokenValue = 'x-x-x';

describe('UserAuthService', () => {
  let userAuthService: UserAuthService;
  let cryptoService: CryptoService;
  let userRepositoryMock: RepositoryMockType<Repository<User>>;
  let tokenRepositoryMock: RepositoryMockType<Repository<UserToken>>;
  let mockUser: User;

  beforeEach(async () => {
    mockUser = Object.assign({}, defaultUser);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthService,
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
    userAuthService = module.get<UserAuthService>(UserAuthService);
    userRepositoryMock = module.get(getRepositoryToken(User));
    tokenRepositoryMock = module.get(getRepositoryToken(UserToken));
  });

  describe('activateUser', () => {
    it('activates a user and deletes the tokens', async () => {
      const token: UserToken = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
      };

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

      await userAuthService.activateUser(activateUserDto);

      expect(tokenRepositoryMock.delete).toHaveBeenCalledWith({
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
        userId: mockUser.id,
      });
      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        {
          id: mockUser.id,
        },
        { isActive: true },
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

      const result = async () => userAuthService.activateUser(activateUserDto);

      await expect(result).rejects.toThrow(BadRequestException);
    });
  });

  describe('createPasswordResetTokenForUser', () => {
    it('throws NotFoundException if user does not exist', async () => {
      const user: PasswordResetRequestDto = { email: 'test@gipfeli.io' };
      userRepositoryMock.findOne.mockReturnValue(null);

      const result = async () =>
        userAuthService.createPasswordResetTokenForUser(user);

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

      const result = await userAuthService.createPasswordResetTokenForUser(
        user,
      );

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
      const token: UserToken = {
        token: await cryptoService.hash(tokenValue),
        tokenType: UserTokenType.PASSWORD_RESET,
        user: mockUser,
        userId: mockUser.id,
        createdAt: new Date(),
      };
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
        passwordConfirmation: newPassword,
      };

      const mockHash = 'hashed-pw';
      const cryptoSpy = jest
        .spyOn(cryptoService, 'hash')
        .mockReturnValue(Promise.resolve('hashed-pw'));

      await userAuthService.resetPassword(setNewPasswordDto);

      expect(tokenRepositoryMock.delete).toHaveBeenCalledWith({
        tokenType: UserTokenType.PASSWORD_RESET,
        userId: mockUser.id,
      });
      expect(userRepositoryMock.update).toHaveBeenCalled();
      expect(cryptoSpy).toHaveBeenCalledWith(newPassword);
      expect(userRepositoryMock.update).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockUser.id }),
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
        passwordConfirmation: newPassword,
      };

      const result = async () =>
        userAuthService.resetPassword(setNewPasswordDto);

      await expect(result).rejects.toThrow(BadRequestException);
    });
  });
  describe('isUserAdministrator', () => {
    it('returns true if the user is an administrator', async () => {
      const mockEmail = 'test@gipfeli.io';
      userRepositoryMock.findOneOrFail.mockReturnValue(true);

      const result = await userAuthService.isUserAdministrator(mockEmail);

      expect(result).toEqual(true);
      expect(userRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
        where: [{ email: mockEmail, role: UserRole.ADMINISTRATOR }],
      });
    });

    it('returns false if the user is not an administrator or does not exist', async () => {
      const mockEmail = 'test@gipfeli.io';
      jest.spyOn(userRepositoryMock, 'findOneOrFail').mockImplementation(() => {
        throw new Error(); // mock an error in the db query as failure
      });

      const result = await userAuthService.isUserAdministrator(mockEmail);

      expect(result).toEqual(false);
      expect(userRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
        where: [{ email: mockEmail, role: UserRole.ADMINISTRATOR }],
      });
    });
  });
});
