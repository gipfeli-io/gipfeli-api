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
import { RoutePrefix } from '../utils/route-prefix';

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
        .post(`${RoutePrefix.AUTH}/refresh`)
        .expect(401);
    });
  });

  describe('Lookup', () => {
    it('/tour-categories (POST)', () => {
      return request(app.getHttpServer())
        .get(`${RoutePrefix.LOOKUP}/tour-categories`)
        .expect(401);
    });
  });

  describe('Media', () => {
    it('/upload-image (POST)', () => {
      return request(app.getHttpServer())
        .post(`${RoutePrefix.MEDIA}/upload-image`)
        .expect(401);
    });

    it('/upload-gpx-file (POST)', () => {
      return request(app.getHttpServer())
        .post(`${RoutePrefix.MEDIA}/upload-gpx-file`)
        .expect(401);
    });

    it('/clean-up-media (GET)', () => {
      return request(app.getHttpServer())
        .get(`${RoutePrefix.MEDIA}/clean-up-media`)
        .expect(401);
    });
  });

  describe('Users', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${RoutePrefix.USER}/`)
        .expect(401);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${RoutePrefix.USER}/${uuid}`)
        .expect(401);
    });
  });

  describe('Tours', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${RoutePrefix.TOUR}/`)
        .expect(401);
    });

    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .post(`${RoutePrefix.TOUR}/`)
        .expect(401);
    });

    it('/:id (GET)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .get(`${RoutePrefix.TOUR}/${uuid}`)
        .expect(401);
    });

    it('/:id (PATCH)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${uuid}`)
        .expect(401);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${RoutePrefix.TOUR}/${uuid}`)
        .expect(401);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
