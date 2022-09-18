import { Test, TestingModule } from '@nestjs/testing';
import { User, UserRole } from '../../user/entities/user.entity';
import { AdminGuard } from './admin.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserDto } from '../../user/dto/user.dto';
import { UserAuthService } from '../../user/user-auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory from '../../utils/mock-utils/repository-mock.factory';
import { UserToken } from '../../user/entities/user-token.entity';
import { CryptoService } from '../../utils/crypto.service';
import { ConfigService } from '@nestjs/config';

const getContextMock = (user?: AuthenticatedUserDto) => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user: user,
      }),
    }),
  } as ExecutionContext;
};

/**
 * As this is a custom guard (without Passport.js), this guard is unit-tested.
 */
describe('AdminGuard', () => {
  let userAuthService: UserAuthService;
  let adminGuard: AdminGuard;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(UserToken),
          useFactory: repositoryMockFactory,
        },
        CryptoService,
        ConfigService,
        UserAuthService,
        AdminGuard,
      ],
    }).compile();

    userAuthService = module.get<UserAuthService>(UserAuthService);
    adminGuard = module.get<AdminGuard>(AdminGuard);
  });

  it('calls user auth service if role is ADMINISTRATOR and returns the service response', async () => {
    const userMock: AuthenticatedUserDto = {
      email: 'text@gipfeli.io',
      id: 'x',
      role: UserRole.ADMINISTRATOR,
    };
    const contextMock = getContextMock(userMock);
    const serviceSpy = jest
      .spyOn(userAuthService, 'isUserAdministrator')
      .mockResolvedValue(true);

    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(true);
    expect(serviceSpy).toHaveBeenCalledWith(userMock.email);
  });

  it('returns false if the user is a normal user and does not call user auth service', async () => {
    const userMock: AuthenticatedUserDto = {
      email: 'text@gipfeli.io',
      id: 'x',
      role: UserRole.USER,
    };
    const contextMock = getContextMock(userMock);
    const serviceSpy = jest.spyOn(userAuthService, 'isUserAdministrator');

    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(false);
    expect(serviceSpy).not.toHaveBeenCalled();
  });

  it('returns false if the role property is missing', async () => {
    const contextMock = getContextMock({
      email: 'text@gipfeli.io',
      id: 'x',
    } as AuthenticatedUserDto);
    const result = await adminGuard.canActivate(contextMock);
    const serviceSpy = jest.spyOn(userAuthService, 'isUserAdministrator');

    expect(result).toEqual(false);
    expect(serviceSpy).not.toHaveBeenCalled();
  });

  it('returns false if the user object is missing', async () => {
    const contextMock = getContextMock();
    const result = await adminGuard.canActivate(contextMock);
    const serviceSpy = jest.spyOn(userAuthService, 'isUserAdministrator');

    expect(result).toEqual(false);
    expect(serviceSpy).not.toHaveBeenCalled();
  });
});
