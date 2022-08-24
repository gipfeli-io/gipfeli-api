import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../../../src/config/database.config';
import securityConfig from '../../../src/config/security.config';
import environmentConfig from '../../../src/config/environment.config';
import integrationsConfig from '../../../src/config/integrations.config';
import mediaConfig from '../../../src/config/media.config';
import { UserModule } from '../../../src/user/user.module';
import { Repository } from 'typeorm';
import { Seeder } from '../utils/seeder';
import { EntityCreator } from '../utils/entity-creator';
import { User, UserRole } from '../../../src/user/entities/user.entity';
import { AuthService } from '../../../src/auth/auth.service';
import createLogin from '../utils/create-login';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { AuthModule } from '../../../src/auth/auth.module';
import { MediaModule } from '../../../src/media/media.module';

const USER_ROUTE_PREFIX = '/users';
const MEDIA_ROUTE_PREFIX = '/media';

describe('Admin Routes can be accessed by an admin user', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let authService: AuthService;
  let tokens: TokenDto;

  const userToCheckAgainst = Seeder.getSeeds().users.find(
    (user) => user.role === UserRole.ADMINISTRATOR,
  );

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
        TypeOrmModule.forFeature([UserSession]),
        ConfigModule.forRoot({
          load: [
            securityConfig,
            environmentConfig,
            integrationsConfig,
            mediaConfig,
          ],
        }),
        AuthModule,
        UserModule,
        MediaModule,
      ],
      providers: [AuthService, JwtService, CryptoService],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get('UserRepository');
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('User', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${USER_ROUTE_PREFIX}/`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(200);
    });

    it('/:id (DELETE)', async () => {
      const user = EntityCreator.createUser();
      const newUser = await userRepository.create(user);
      await userRepository.save(newUser);

      return request(app.getHttpServer())
        .delete(`${USER_ROUTE_PREFIX}/${newUser.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(200);
    });
  });

  describe('cleanUpMedia throws 401 as different token is required', () => {
    it('/clean-up-media (GET)', () => {
      return request(app.getHttpServer())
        .get(`${MEDIA_ROUTE_PREFIX}/clean-up-media`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
