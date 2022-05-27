import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../user/dto/user';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
import { HashService } from '../shared/hash.service';
import * as bcrypt from 'bcrypt';

let result: UserDto;
const userConfig = {
  username: 'sara@gipfeli.io',
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
      firstname: 'Sara',
      lastname: 'Müller',
      username: userConfig.username,
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
        HashService,
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
    it('should return a user matching the parameters username and password', async () => {
      const authServiceSpy = jest.spyOn(service, 'validateUser');
      const { unhashedPassword, username } = userConfig;
      const { password, ...user } = result;

      expect(await service.validateUser(username, unhashedPassword)).toEqual(
        user,
      );
      expect(authServiceSpy).toHaveBeenCalledWith(username, unhashedPassword);
    });

    it('should return null when password does not match', async () => {
      const { username } = userConfig;
      const password = 'this-is-a-wrong-password';

      expect(await service.validateUser(username, password)).toEqual(null);
    });

    it('should return null when username does not match', async () => {
      result = null; // reset result to null so that user service mock returns null
      const username = 'peter@gipfeli.io';
      const password = '5678';

      expect(await service.validateUser(username, password)).toEqual(null);
    });
  });
});
