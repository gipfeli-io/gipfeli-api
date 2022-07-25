import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../../utils/mock-utils/repository-mock.factory';
import { User, UserRole } from '../../user/entities/user.entity';
import { Repository } from 'typeorm';
import { AdminGuard } from './admin.guard';
import { ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserDto } from '../../user/dto/user';

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
  let userRepositoryMock: RepositoryMockType<Repository<User>>;
  let adminGuard: AdminGuard;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        AdminGuard,
      ],
    }).compile();

    userRepositoryMock = module.get(getRepositoryToken(User));
    adminGuard = module.get<AdminGuard>(AdminGuard);
  });

  it('returns true if the user is a valid admin', async () => {
    const userMock: AuthenticatedUserDto = {
      email: 'text@gipfeli.io',
      id: 'x',
      role: UserRole.ADMINISTRATOR,
    };
    const contextMock = getContextMock(userMock);
    const repositorySpy = jest
      .spyOn(userRepositoryMock, 'findOneOrFail')
      .mockReturnValue({ role: UserRole.ADMINISTRATOR });

    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(true);
    expect(repositorySpy).toHaveBeenCalledWith({
      where: [{ email: userMock.email, role: userMock.role }],
    });
  });

  it('returns false if the user is a normal user', async () => {
    const userMock: AuthenticatedUserDto = {
      email: 'text@gipfeli.io',
      id: 'x',
      role: UserRole.USER,
    };
    const contextMock = getContextMock(userMock);

    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(false);
    expect(userRepositoryMock.findOneOrFail).not.toHaveBeenCalled();
  });

  it('returns false if the user is an invalid admin', async () => {
    const userMock: AuthenticatedUserDto = {
      email: 'text@gipfeli.io',
      id: 'x',
      role: UserRole.ADMINISTRATOR,
    };
    const contextMock = getContextMock(userMock);
    jest.spyOn(userRepositoryMock, 'findOneOrFail').mockImplementation(() => {
      throw new Error(); // mock an error in the db query as failure
    });

    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(false);
    expect(userRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: [{ email: userMock.email, role: userMock.role }],
    });
  });

  it('returns false if the role property is missing', async () => {
    const contextMock = getContextMock({
      email: 'text@gipfeli.io',
      id: 'x',
    } as AuthenticatedUserDto);
    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(false);
    expect(userRepositoryMock.findOneOrFail).not.toHaveBeenCalled();
  });

  it('returns false if the user object is missing', async () => {
    const contextMock = getContextMock();
    const result = await adminGuard.canActivate(contextMock);

    expect(result).toEqual(false);
    expect(userRepositoryMock.findOneOrFail).not.toHaveBeenCalled();
  });
});
