import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../../src/config/database.config';
import securityConfig from '../../src/config/security.config';
import environmentConfig from '../../src/config/environment.config';
import integrationsConfig from '../../src/config/integrations.config';
import mediaConfig from '../../src/config/media.config';
import { UserModule } from '../../src/user/user.module';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../src/auth/guards/jwt-auth.guard';
import { TourModule } from '../../src/tour/tour.module';
import { LookupModule } from '../../src/lookup/lookup.module';
import { MediaModule } from '../../src/media/media.module';
import { AuthenticatedUserDto } from '../../src/user/dto/user.dto';
import { Repository } from 'typeorm';
import { Tour } from '../../src/tour/entities/tour.entity';
import { Seeder } from '../utils/seeder';
import { EntityCreator } from '../utils/entity-creator';
import { User, UserRole } from '../../src/user/entities/user.entity';

const USER_ROUTE_PREFIX = '/users';

describe('Admin Routes can be accessed by an admin user', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  const userToCheckAgainst = Seeder.getSeeds().users.find(
    (user) => user.role === UserRole.ADMINISTRATOR,
  );
  const authenticatedUser: AuthenticatedUserDto = userToCheckAgainst;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              load: [databaseConfig],
            }),
          ],
          useFactory: (configService: ConfigService) =>
            configService.get('database'),
          inject: [ConfigService],
        }),
        ConfigModule.forRoot({
          load: [
            securityConfig,
            environmentConfig,
            integrationsConfig,
            mediaConfig,
          ],
        }),
        UserModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context.switchToHttp().getRequest();
          req.user = authenticatedUser;
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get('UserRepository');

    await app.init();
  });

  describe('User', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${USER_ROUTE_PREFIX}/`)
        .expect(200);
    });

    it('/:id (DELETE)', async () => {
      const user = EntityCreator.createUser();
      const newUser = await userRepository.create(user);
      await userRepository.save(newUser);

      return request(app.getHttpServer())
        .delete(`${USER_ROUTE_PREFIX}/${newUser.id}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
