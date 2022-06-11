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

let result: UserDto;
const userConfig = {
  email: 'sara@gipfeli.io',
  unhashedPassword: 'this-is-my-secure-password',
};
const userRepositoryMock = {
  findOne: jest.fn(() => Promise.resolve(result)),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeAll(() => {
    result = {
      id: '2bd0b79d-071a-4672-0804-027d97f98a6e',
      firstName: 'Sara',
      lastName: 'Müller',
      email: userConfig.email,
      password: bcrypt.hashSync(userConfig.unhashedPassword, 10),
      tours: [],
    };
  });

  beforeEach(async () => {
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
          useValue: userRepositoryMock,
        },
      ],
    })
      .useMocker((token) => {
        if (token === UserService) {
          return {
            findOne: jest.fn().mockResolvedValue(result),
          };
        }
      })
      .compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return a user matching the parameters email and password', async () => {
      const authServiceSpy = jest.spyOn(service, 'validateUser');
      const { unhashedPassword, email } = userConfig;
      const { password, ...user } = result;

      expect(await service.validateUser(email, unhashedPassword)).toEqual(
        user,
      );
      expect(authServiceSpy).toHaveBeenCalledWith(email, unhashedPassword);
    });

    it('should return null when password does not match', async () => {
      const { email } = userConfig;
      const password = 'this-is-a-wrong-password';

      expect(await service.validateUser(email, password)).toEqual(null);
    });

    it('throws NotFoundException if user and password do not match or do not exist', async () => {
      result = null; // reset result to null so that user service mock returns null
      const email = 'peter@gipfeli.io';
      const password = '5678';

      const call = async () => await service.validateUser(email, password);

      await expect(call).rejects.toThrow(NotFoundException);
    });
  });
});
