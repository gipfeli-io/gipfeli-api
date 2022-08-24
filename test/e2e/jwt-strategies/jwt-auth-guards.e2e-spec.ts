import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../../src/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../../../src/config/database.config';
import securityConfig from '../../../src/config/security.config';
import environmentConfig from '../../../src/config/environment.config';
import integrationsConfig from '../../../src/config/integrations.config';
import mediaConfig from '../../../src/config/media.config';
import { UserModule } from '../../../src/user/user.module';
import { Seeder } from '../utils/seeder';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { UserRole } from '../../../src/user/entities/user.entity';
import createLogin from '../utils/create-login';
import { TourModule } from '../../../src/tour/tour.module';

const AUTH_ROUTE_PREFIX = '/auth';
const TOUR_ROUTE_PREFIX = '/tours';

describe('Check that guards check for the correct token', () => {
  let app: INestApplication;
  let authService: AuthService;
  let tokens: TokenDto;

  const userToCheckAgainst = Seeder.getSeeds().users.find(
    (user) => user.role === UserRole.USER,
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
        TourModule,
      ],
      providers: [AuthService, JwtService, CryptoService],
    }).compile();

    app = moduleFixture.createNestApplication();
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('RefreshTokenGuard', () => {
    it('it fails if an access token is sent', () => {
      return request(app.getHttpServer())
        .post(`${AUTH_ROUTE_PREFIX}/refresh`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(401);
    });

    it('it succeeds if a refresh token is sent', () => {
      return request(app.getHttpServer())
        .post(`${AUTH_ROUTE_PREFIX}/refresh`)
        .set('Authorization', 'Bearer ' + tokens.refreshToken)
        .expect(201);
    });
  });

  describe('JwtAuthGuard', () => {
    it('it fails if a refresh token is sent', () => {
      return request(app.getHttpServer())
        .get(`${TOUR_ROUTE_PREFIX}/`)
        .set('Authorization', 'Bearer ' + tokens.refreshToken)
        .expect(401);
    });

    it('it succeeds if an access token is sent', () => {
      return request(app.getHttpServer())
        .get(`${TOUR_ROUTE_PREFIX}/`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
