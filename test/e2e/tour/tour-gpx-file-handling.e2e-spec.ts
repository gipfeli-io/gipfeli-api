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
import { User, UserRole } from '../../../src/user/entities/user.entity';
import createLogin from '../utils/create-login';
import { EntityCreator } from '../utils/entity-creator';
import { CreateTourDto, UpdateTourDto } from '../../../src/tour/dto/tour.dto';
import { faker } from '@faker-js/faker';
import { Point } from 'geojson';
import { RoutePrefix } from '../utils/route-prefix';
import { GpxFile } from '../../../src/media/entities/gpx-file.entity';

const fakePoint: Point = {
  type: 'Point',
  coordinates: [7.920462, 47.328439],
};

describe('Tour', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;
  let gpxFileRepository: Repository<GpxFile>;
  let userRepository: Repository<User>;
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
    gpxFileRepository = moduleFixture.get('GpxFileRepository');
    userRepository = moduleFixture.get('UserRepository');
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('Gpx File handling', () => {
    it('creating a tour assigns uploaded GPX file in the create request to the tour', async () => {
      const gpxFile = await gpxFileRepository.save(
        EntityCreator.createGpxFile(userToCheckAgainst),
      );

      const tour: CreateTourDto = {
        name: faker.lorem.sentence(2),
        description: faker.lorem.sentences(10),
        endLocation: fakePoint,
        startLocation: fakePoint,
        images: [],
        categories: [],
        gpxFile: gpxFile,
      };

      await request(app.getHttpServer())
        .post(`${RoutePrefix.TOUR}/`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...tour });

      const createdTour = await tourRepository.findOne(
        {
          name: tour.name,
          description: tour.description,
        },
        { relations: ['gpxFile'] },
      );

      expect(createdTour.gpxFile.id).toEqual(gpxFile.id);
    });

    it('updating a tour correctly updates gpxFile relation', async () => {
      const gpxFile = await gpxFileRepository.save(
        EntityCreator.createGpxFile(userToCheckAgainst),
      );
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst, [], gpxFile),
      );

      const newGpxFile = await gpxFileRepository.save(
        EntityCreator.createGpxFile(userToCheckAgainst),
      );
      const updateTour: UpdateTourDto = {
        gpxFile: newGpxFile,
        images: [],
        categories: [],
      };

      await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedTour = await tourRepository.findOne(tour.id, {
        relations: ['gpxFile'],
      });

      expect(updatedTour.gpxFile.id).toEqual(newGpxFile.id);
    });

    it('assigning a gpxFile that does not exist in the database fails silently', async () => {
      // Note: this test is only checked against the update route; the create
      // route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );
      const gpxFile = EntityCreator.createGpxFile(userToCheckAgainst);

      const updateTour: UpdateTourDto = {
        gpxFile: gpxFile,
        images: [],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedTour = await tourRepository.findOne(tour.id, {
        relations: ['gpxFile'],
      });

      expect(response.statusCode).toEqual(200);
      expect(updatedTour.gpxFile).toEqual(null);
    });

    it('assigning a gpxFile that belongs to another user fails silently', async () => {
      // Note: this test is only checked against the update route; the create
      // route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );

      const otherUser = await userRepository.save(EntityCreator.createUser());
      const gpxFile = await gpxFileRepository.save(
        EntityCreator.createGpxFile(otherUser),
      );

      const updateTour: UpdateTourDto = {
        gpxFile: gpxFile,
        images: [],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedTour = await tourRepository.findOne(tour.id, {
        relations: ['gpxFile'],
      });

      expect(response.statusCode).toEqual(200);
      expect(updatedTour.gpxFile).toEqual(null);
    });

    it('assigning a gpxFile that belongs to another tour already fails silently', async () => {
      // Note: this test is only checked against the update route; the
      // create route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );

      const gpxFile = await gpxFileRepository.save(
        EntityCreator.createGpxFile(userToCheckAgainst),
      );
      await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst, [], gpxFile),
      );

      const updateTour: UpdateTourDto = {
        gpxFile: gpxFile,
        images: [],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedTour = await tourRepository.findOne(tour.id, {
        relations: ['gpxFile'],
      });

      expect(response.statusCode).toEqual(200);
      expect(updatedTour.gpxFile).toEqual(null);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
