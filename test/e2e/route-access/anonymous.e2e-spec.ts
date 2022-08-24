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
import { randomUUID } from 'crypto';
import { TourModule } from '../../../src/tour/tour.module';
import { LookupModule } from '../../../src/lookup/lookup.module';
import { MediaModule } from '../../../src/media/media.module';

const AUTH_ROUTE_PREFIX = '/auth';
const USER_ROUTE_PREFIX = '/users';
const TOUR_ROUTE_PREFIX = '/tours';
const LOOKUP_ROUTE_PREFIX = '/lookup';
const MEDIA_ROUTE_PREFIX = '/media';

describe('Anonymous route access on protected routes throws 401', () => {
  let app: INestApplication;

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
        AuthModule,
        UserModule,
        TourModule,
        LookupModule,
        MediaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('Auth', () => {
    it('/refresh (POST)', () => {
      return request(app.getHttpServer())
        .post(`${AUTH_ROUTE_PREFIX}/refresh`)
        .expect(401);
    });
  });

  describe('Lookup', () => {
    it('/tour-categories (POST)', () => {
      return request(app.getHttpServer())
        .get(`${LOOKUP_ROUTE_PREFIX}/tour-categories`)
        .expect(401);
    });
  });

  describe('Media', () => {
    it('/upload-image (POST)', () => {
      return request(app.getHttpServer())
        .post(`${MEDIA_ROUTE_PREFIX}/upload-image`)
        .expect(401);
    });

    it('/upload-gpx-file (POST)', () => {
      return request(app.getHttpServer())
        .post(`${MEDIA_ROUTE_PREFIX}/upload-gpx-file`)
        .expect(401);
    });

    it('/clean-up-media (GET)', () => {
      return request(app.getHttpServer())
        .get(`${MEDIA_ROUTE_PREFIX}/clean-up-media`)
        .expect(401);
    });
  });

  describe('Users', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${USER_ROUTE_PREFIX}/`)
        .expect(401);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${USER_ROUTE_PREFIX}/${uuid}`)
        .expect(401);
    });
  });

  describe('Tours', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${TOUR_ROUTE_PREFIX}/`)
        .expect(401);
    });

    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .post(`${TOUR_ROUTE_PREFIX}/`)
        .expect(401);
    });

    it('/:id (GET)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .get(`${TOUR_ROUTE_PREFIX}/${uuid}`)
        .expect(401);
    });

    it('/:id (PATCH)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .patch(`${TOUR_ROUTE_PREFIX}/${uuid}`)
        .expect(401);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${TOUR_ROUTE_PREFIX}/${uuid}`)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
