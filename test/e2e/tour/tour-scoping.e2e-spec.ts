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
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { TokenDto } from '../../../src/auth/dto/auth.dto';
import { User } from '../../../src/user/entities/user.entity';
import createLogin from '../utils/create-login';
import { EntityCreator } from '../utils/entity-creator';
import { RoutePrefix } from '../utils/route-prefix';

/**
 * Creates two users with one tour each and returns them and their tour. Also
 * creates a mock login for userToCheck and returns the TokenDTO.
 * @param userRepository
 * @param tourRepository
 * @param authService
 */
async function mockTwoUsers(
  userRepository: Repository<User>,
  tourRepository: Repository<Tour>,
  authService: AuthService,
): Promise<{
  otherUserTour: Tour;
  userToCheckTour: Tour;
  tokens: TokenDto;
  userToCheck: User;
  otherUser: User;
}> {
  const userToCheck = await userRepository.save(EntityCreator.createUser());
  const userToCheckTour = await tourRepository.save(
    EntityCreator.createTour(userToCheck),
  );
  const tokens = await createLogin(authService, userToCheck);
  const otherUser = await userRepository.save(EntityCreator.createUser());
  const otherUserTour = await tourRepository.save(
    EntityCreator.createTour(otherUser),
  );

  return { userToCheck, userToCheckTour, tokens, otherUser, otherUserTour };
}

describe('Tour', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;
  let userRepository: Repository<User>;
  let authService: AuthService;

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
    userRepository = moduleFixture.get('UserRepository');
    authService = moduleFixture.get(AuthService);

    await app.init();
  });

  describe('Tour access and management is correctly scoped to the user', () => {
    it('/tours (GET) returns only tours of the current user', async () => {
      const { userToCheckTour, tokens } = await mockTwoUsers(
        userRepository,
        tourRepository,
        authService,
      );

      const response = await request(app.getHttpServer())
        .get(`${RoutePrefix.TOUR}/`)
        .set('Authorization', 'Bearer ' + tokens.accessToken);

      expect(response.body.length).toEqual(1);
      expect(response.body[0].id).toEqual(userToCheckTour.id);
    });

    it("/tours/:id (GET) throws 404 if trying to access another user's tour", async () => {
      const { tokens, otherUserTour } = await mockTwoUsers(
        userRepository,
        tourRepository,
        authService,
      );

      return request(app.getHttpServer())
        .get(`${RoutePrefix.TOUR}/${otherUserTour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(404);
    });

    it("/tours/:id (PATCH) throws 404 if trying to update another user's tour", async () => {
      const { tokens, otherUserTour } = await mockTwoUsers(
        userRepository,
        tourRepository,
        authService,
      );

      return request(app.getHttpServer())
        .patch(`${RoutePrefix.TOUR}/${otherUserTour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .send({ name: 'Changing the name', images: [], categories: [] })
        .expect(404);
    });

    it("/tours/:id (DELETE) throws 404 if trying to update another user's tour", async () => {
      const { tokens, otherUserTour } = await mockTwoUsers(
        userRepository,
        tourRepository,
        authService,
      );

      return request(app.getHttpServer())
        .delete(`${RoutePrefix.TOUR}/${otherUserTour.id}`)
        .set('Authorization', 'Bearer ' + tokens.accessToken)
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
