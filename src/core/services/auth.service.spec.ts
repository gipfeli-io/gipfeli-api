import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../../infrastructure/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserDto } from '../dtos/user';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants';

let result: UserDto = {
  id: '2bd0b79d-071a-4672-0804-027d97f98a6e',
  firstname: 'Sara',
  lastname: 'Müller',
  username: 'sara@gipfeli.io',
  password: '5678',
  tours: [],
};

const userRepositoryMock = {
  findOne: jest.fn(() => Promise.resolve(result)),
};

describe('AuthService', () => {
  let service: AuthService;

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

  it('validateUser: should return a user matching the parameters username and password', async () => {
    const authServiceSpy = jest.spyOn(service, 'validateUser');
    const username = 'sara@gipfeli.io';
    const { password, ...user } = result;
    expect(await service.validateUser(username, password)).toEqual(user);
    expect(authServiceSpy).toHaveBeenCalledWith(username, password);
  });

  it('validateUser: should return null when password does not match', async () => {
    const username = 'sara@gipfeli.io';
    const password = '1234';
    expect(await service.validateUser(username, password)).toEqual(null);
  });

  it('validateUser: should return null when username does not match', async () => {
    result = null; // reset result to null so that user service mock returns null
    const username = 'peter@gipfeli.io';
    const password = '5678';
    expect(await service.validateUser(username, password)).toEqual(null);
  });
});
