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
import { TourModule } from '../../../src/tour/tour.module';
import { LookupModule } from '../../../src/lookup/lookup.module';
import { MediaModule } from '../../../src/media/media.module';
import { Repository } from 'typeorm';
import { Tour } from '../../../src/tour/entities/tour.entity';
import { Seeder } from '../utils/seeder';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { UserRole } from '../../../src/user/entities/user.entity';
import createLogin from '../utils/create-login';
import { EntityCreator } from '../utils/entity-creator';
import { CreateTourDto, UpdateTourDto } from '../../../src/tour/dto/tour.dto';
import { faker } from '@faker-js/faker';
import { Point } from 'geojson';
import { RoutePrefix } from '../utils/route-prefix';

const fakePoint: Point = {
  type: 'Point',
  coordinates: [7.920462, 47.328439],
};

describe('Tour', () => {
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
    }).compile();

    app = moduleFixture.createNestApplication();
    tourRepository = moduleFixture.get('TourRepository');
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('Tour management', () => {
    describe('create tour', () => {
      it('a tour is created with user supplied parameters and assigned to the user', async () => {
        const tour: CreateTourDto = {
          name: faker.lorem.sentence(2),
          description: faker.lorem.sentences(10),
          endLocation: fakePoint,
          startLocation: fakePoint,
          images: [],
          categories: [],
          gpxFile: null,
        };

        await request(app.getHttpServer())
          .post(`${RoutePrefix.TOUR}/`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .send({ ...tour });

        const createdTour = await tourRepository.findOne({
          name: tour.name,
          description: tour.description,
        });

        expect(createdTour).toBeDefined();
        expect(createdTour.userId).toEqual(userToCheckAgainst.id);
      });
    });

    describe('update tour', () => {
      it('a tour is updated with user supplied parameters', async () => {
        const tour = await tourRepository.save(
          EntityCreator.createTour(userToCheckAgainst),
        );

        const updateTour: UpdateTourDto = {
          name: faker.lorem.sentence(2),
          description: faker.lorem.sentences(10),
          endLocation: fakePoint,
          startLocation: fakePoint,
          images: [],
          categories: [],
          gpxFile: null,
        };

        await request(app.getHttpServer())
          .patch(`${RoutePrefix.TOUR}/${tour.id}`)
          .set('Authorization', 'Bearer ' + tokens.accessToken)
          .send({ ...updateTour });

        const updatedTour = await tourRepository.findOne(tour.id);

        expect(updatedTour.userId).toEqual(userToCheckAgainst.id);
        expect(updatedTour.name).toEqual(updateTour.name);
        expect(updatedTour.description).toEqual(updateTour.description);
        expect(updatedTour.startLocation).toEqual(updateTour.startLocation);
        expect(updatedTour.endLocation).toEqual(updateTour.endLocation);
        expect(updatedTour.updatedAt).not.toEqual(tour.updatedAt);
      });
    });

    describe('delete tour', () => {
      it('a tour is deleted from the database', async () => {
        const tour = await tourRepository.save(
          EntityCreator.createTour(userToCheckAgainst),
        );

        const response = await request(app.getHttpServer())
          .delete(`${RoutePrefix.TOUR}/${tour.id}`)
          .set('Authorization', 'Bearer ' + tokens.accessToken);

        const createdTour = await tourRepository.findOne(tour.id);

        expect(response.statusCode).toEqual(200);
        expect(createdTour).not.toBeDefined();
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
