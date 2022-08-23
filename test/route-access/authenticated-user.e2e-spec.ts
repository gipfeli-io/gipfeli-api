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

const AUTH_ROUTE_PREFIX = '/auth';
const USER_ROUTE_PREFIX = '/users';
const TOUR_ROUTE_PREFIX = '/tours';
const LOOKUP_ROUTE_PREFIX = '/lookup';
const MEDIA_ROUTE_PREFIX = '/media';

describe('Authenticated user routes can be accessed by a logged-in user', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;

  const userToCheckAgainst = Seeder.getSeeds().users[0];
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
        AuthModule,
        UserModule,
        TourModule,
        LookupModule,
        MediaModule,
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
    tourRepository = moduleFixture.get('TourRepository');

    await app.init();
  });

  describe('Protected routes may be accessed by logged in users', () => {
    describe('Lookup', () => {
      it('/tour-categories (POST)', () => {
        return request(app.getHttpServer())
          .get(`${LOOKUP_ROUTE_PREFIX}/tour-categories`)
          .expect(200);
      });
    });

    describe('Tours', () => {
      it('/ (GET)', () => {
        return request(app.getHttpServer())
          .get(`${TOUR_ROUTE_PREFIX}/`)
          .expect(200);
      });

      it('/ (POST)', () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        return request(app.getHttpServer())
          .post(`${TOUR_ROUTE_PREFIX}/`)
          .send({ ...tour })
          .expect(201);
      });

      it('/:id (GET)', async () => {
        const tour = await tourRepository.findOne({
          where: { userId: userToCheckAgainst.id },
        });

        return request(app.getHttpServer())
          .get(`${TOUR_ROUTE_PREFIX}/${tour.id}`)
          .expect(200);
      });

      it('/:id (PATCH)', async () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        const newTour = await tourRepository.create(tour);
        await tourRepository.save(newTour);

        return request(app.getHttpServer())
          .patch(`${TOUR_ROUTE_PREFIX}/${newTour.id}`)
          .send({ name: 'Changing the name', images: [] })
          .expect(200);
      });

      it('/:id (DELETE)', async () => {
        const tour = EntityCreator.createTour(userToCheckAgainst);
        const newTour = await tourRepository.create(tour);
        await tourRepository.save(newTour);

        return request(app.getHttpServer())
          .delete(`${TOUR_ROUTE_PREFIX}/${newTour.id}`)
          .expect(200);
      });
    });
  });

  describe('User routes throw 403 as admin is required', () => {
    it('/ (POST)', () => {
      return request(app.getHttpServer())
        .get(`${USER_ROUTE_PREFIX}/`)
        .expect(403);
    });

    it('/:id (DELETE)', () => {
      const uuid = randomUUID();
      return request(app.getHttpServer())
        .delete(`${USER_ROUTE_PREFIX}/${uuid}`)
        .expect(403);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
