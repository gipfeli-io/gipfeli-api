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
import { Image } from '../../../src/media/entities/image.entity';
import { RoutePrefix } from '../utils/route-prefix';

const fakePoint: Point = {
  type: 'Point',
  coordinates: [7.920462, 47.328439],
};

describe('Tour', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;
  let imageRepository: Repository<Image>;
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
    imageRepository = moduleFixture.get('ImageRepository');
    userRepository = moduleFixture.get('UserRepository');
    authService = moduleFixture.get(AuthService);
    tokens = await createLogin(authService, userToCheckAgainst);

    await app.init();
  });

  describe('Tour image handling', () => {
    it('creating a tour assigns uploaded images sent in the create request to the tour', async () => {
      const images = [
        EntityCreator.createImage(userToCheckAgainst),
        EntityCreator.createImage(userToCheckAgainst),
      ];
      await imageRepository.save(images);

      const tour: CreateTourDto = {
        name: faker.lorem.sentence(2),
        description: faker.lorem.sentences(10),
        endLocation: fakePoint,
        startLocation: fakePoint,
        images: images,
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
      const updatedImages = await imageRepository.find({
        tourId: createdTour.id,
      });

      expect(updatedImages.length).toEqual(2);
    });

    it('updating a tour correctly synchronizes image relations', async () => {
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );
      const startImages = await imageRepository.save([
        EntityCreator.createImage(userToCheckAgainst, tour),
        EntityCreator.createImage(userToCheckAgainst, tour),
      ]);

      // We create a new image and update the tour to contain the first of the
      // initial images and the new image, but not the second initial image
      const newImage = await imageRepository.save(
        EntityCreator.createImage(userToCheckAgainst),
      );
      const imagesToUpdate = [newImage, startImages[0]];
      const updateTour: UpdateTourDto = {
        images: imagesToUpdate,
        categories: [],
      };

      await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedImages = await imageRepository.find({
        tourId: tour.id,
      });
      const unassignedImage = await imageRepository.findOne(startImages[1].id);

      // Tour should only contain the first of the initial images and the new
      // image; and the second initial image should have no tour relation
      expect(updatedImages.length).toEqual(2);
      expect(updatedImages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: startImages[0].id,
          }),
        ]),
      );
      expect(updatedImages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: newImage.id,
          }),
        ]),
      );
      expect(updatedImages).not.toContain(unassignedImage);
      expect(unassignedImage.tourId).toEqual(null);
    });

    it('updating a tour with an empty array removes all image relations', async () => {
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );
      await imageRepository.save([
        EntityCreator.createImage(userToCheckAgainst, tour),
        EntityCreator.createImage(userToCheckAgainst, tour),
      ]);

      const updateTour: UpdateTourDto = {
        images: [],
        categories: [],
      };

      await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const updatedImages = await imageRepository.find({
        tourId: tour.id,
      });

      expect(updatedImages.length).toEqual(0);
    });

    it('assigning an image that does not exist in the database fails silently', async () => {
      // Note: this test is only checked against the update route; the create
      // route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );
      const image = EntityCreator.createImage(userToCheckAgainst);

      const updateTour: UpdateTourDto = {
        images: [image],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });
      const images = await imageRepository.find({ tourId: tour.id });

      expect(response.statusCode).toEqual(200);
      expect(images.length).toEqual(0);
    });

    it('assigning an image that belongs to another user fails silently', async () => {
      // Note: this test is only checked against the update route; the create
      // route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );

      const otherUser = await userRepository.save(EntityCreator.createUser());
      const otherUserTour = await tourRepository.save(
        EntityCreator.createTour(otherUser),
      );
      const image = await imageRepository.save(
        EntityCreator.createImage(otherUser, otherUserTour),
      );

      const updateTour: UpdateTourDto = {
        images: [{ ...image }],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const tourImagesCount = await imageRepository.count({ tourId: tour.id });
      const refreshedImage = await imageRepository.findOne(image.id);

      expect(response.statusCode).toEqual(200);
      expect(tourImagesCount).toEqual(0);
      expect(refreshedImage.userId).toEqual(otherUser.id);
      expect(refreshedImage.tourId).toEqual(otherUserTour.id);
    });

    it('assigning an image that belongs to another tour already fails silently', async () => {
      // Note: this test is only checked against the update route; the
      // create route uses the same flow.
      const tour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );

      const otherTour = await tourRepository.save(
        EntityCreator.createTour(userToCheckAgainst),
      );
      const image = await imageRepository.save(
        EntityCreator.createImage(userToCheckAgainst, otherTour),
      );

      const updateTour: UpdateTourDto = {
        images: [{ ...image }],
        categories: [],
      };

      const response = await request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${tour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ ...updateTour });

      const tourImagesCount = await imageRepository.count({ tourId: tour.id });
      const refreshedImage = await imageRepository.findOne(image.id);

      expect(response.statusCode).toEqual(200);
      expect(tourImagesCount).toEqual(0);
      expect(refreshedImage.tourId).toEqual(otherTour.id);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
