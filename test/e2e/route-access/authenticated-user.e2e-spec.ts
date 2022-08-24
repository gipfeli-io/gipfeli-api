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
import { Repository } from 'typeorm';
import { Tour } from '../../../src/tour/entities/tour.entity';
import { Seeder } from '../utils/seeder';
import { EntityCreator } from '../utils/entity-creator';
import * as path from 'path';
import {
  StorageProvider,
  StorageProviderInterface,
  UploadedFileHandle,
} from '../../../src/media/providers/types/storage-provider';
import * as fs from 'fs';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { UserRole } from '../../../src/user/entities/user.entity';
import createLogin from '../utils/create-login';

const AUTH_ROUTE_PREFIX = '/auth';
const USER_ROUTE_PREFIX = '/users';
const TOUR_ROUTE_PREFIX = '/tours';
const LOOKUP_ROUTE_PREFIX = '/lookup';
const MEDIA_ROUTE_PREFIX = '/media';

const fileResponseMock: UploadedFileHandle = {
  identifier: 'mocked-identifier',
  metadata: {},
};

const storageProviderMock: StorageProvider = {
  put: jest.fn().mockReturnValue(fileResponseMock),
  deleteMany: jest.fn(),
};

describe('Authenticated user routes can be accessed by a logged-in user', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;
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
        LookupModule,
        MediaModule,
      ],
      providers: [AuthService, JwtService, CryptoService],
    })
      .overrideProvider(StorageProviderInterface)
      .useValue(storageProviderMock)
      .compile();

    app = moduleFixture.createNestApplication();
    tourRepository = moduleFixture.get('TourRepository');
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('Protected routes may be accessed by logged in users', () => {
    describe('Auth', () => {
      it('/refresh (POST) fails with auth token', () => {
        return request(app.getHttpServer())
          .post(`${AUTH_ROUTE_PREFIX}/refresh`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .expect(401);
      });

      it('/refresh (POST) works with refresh token', () => {
        return request(app.getHttpServer())
          .post(`${AUTH_ROUTE_PREFIX}/refresh`)
          .set('Authorization', 'Bearer ' + tokens.refreshToken)
          .expect(201);
      });
    });

    describe('Lookup', () => {
      it('/tour-categories (POST)', () => {
        return request(app.getHttpServer())
          .get(`${LOOKUP_ROUTE_PREFIX}/tour-categories`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .expect(200);
      });
    });

    describe('Media', () => {
      it('/upload-image (POST)', () => {
        const mockFile = path.join(__dirname, '../../mocks/image_with_gps.jpg');

        return request(app.getHttpServer())
          .post(`${MEDIA_ROUTE_PREFIX}/upload-image`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .attach('file', mockFile)
          .expect(201);
      });

      it('/upload-gpx-file (POST)', () => {
        const mockFile = path.join(__dirname, '../../mocks/fells_loop.gpx');
        const buffer = fs.readFileSync(mockFile);

        return request(app.getHttpServer())
          .post(`${MEDIA_ROUTE_PREFIX}/upload-gpx-file`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .attach('file', mockFile, {
            filename: 'test.gpx',
            contentType: 'application/octet-stream',
          })
          .expect(201);
      });
    });

    describe('Tours', () => {
      it('/ (GET)', () => {
        return request(app.getHttpServer())
          .get(`${TOUR_ROUTE_PREFIX}/`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .expect(200);
      });

      it('/ (POST)', () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        return request(app.getHttpServer())
          .post(`${TOUR_ROUTE_PREFIX}/`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .send({ ...tour })
          .expect(201);
      });

      it('/:id (GET)', async () => {
        const tour = await tourRepository.findOne({
          where: { userId: userToCheckAgainst.id },
        });

        return request(app.getHttpServer())
          .get(`${TOUR_ROUTE_PREFIX}/${tour.id}`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .expect(200);
      });

      it('/:id (PATCH)', async () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        const newTour = await tourRepository.create(tour);
        await tourRepository.save(newTour);

        return request(app.getHttpServer())
          .patch(`${TOUR_ROUTE_PREFIX}/${newTour.id}`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .send({ name: 'Changing the name', images: [] })
          .expect(200);
      });

      it('/:id (DELETE)', async () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        const newTour = await tourRepository.create(tour);
        await tourRepository.save(newTour);

        return request(app.getHttpServer())
          .delete(`${TOUR_ROUTE_PREFIX}/${newTour.id}`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .expect(200);
      });
    });
  });

  describe('User routes throw 403 as admin is required', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${USER_ROUTE_PREFIX}/`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(403);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${USER_ROUTE_PREFIX}/${uuid}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(403);
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
