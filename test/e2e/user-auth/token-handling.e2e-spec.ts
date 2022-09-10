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
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { User } from '../../../src/user/entities/user.entity';
import { EntityCreator } from '../utils/entity-creator';
import { RoutePrefix } from '../utils/route-prefix';
import {
  UserToken,
  UserTokenType,
} from '../../../src/user/entities/user-token.entity';
import { ActivateUserDto } from '../../../src/user/dto/user.dto';
import { SetNewPasswordDto } from '../../../src/auth/dto/auth.dto';
import * as dayjs from 'dayjs';

describe('UserAuth', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let userTokenRepository: Repository<UserToken>;
  let cryptoService: CryptoService;

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
    userRepository = moduleFixture.get('UserRepository');
    userTokenRepository = moduleFixture.get('UserTokenRepository');
    cryptoService = moduleFixture.get(CryptoService);

    await app.init();
  });

  describe('Token handling: Activation', () => {
    it('activating a user removes all activation tokens, but not reset tokens', async () => {
      const user = await userRepository.save(EntityCreator.createUser(false));
      const tokenWithHash = await cryptoService.getRandomTokenWithHash();
      const tokenToCheck = EntityCreator.createUserToken(
        user,
        UserTokenType.ACCOUNT_ACTIVATION,
        tokenWithHash.tokenHash,
      );

      await userTokenRepository.save([
        tokenToCheck,
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
        EntityCreator.createUserToken(user, UserTokenType.PASSWORD_RESET),
        EntityCreator.createUserToken(user, UserTokenType.PASSWORD_RESET),
      ]);
      const activationRequest: ActivateUserDto = {
        userId: user.id,
        token: tokenWithHash.token,
      };

      await request(app.getHttpServer())
        .post(`${RoutePrefix.AUTH}/activate`)
        .send({ ...activationRequest })
        .expect(201);

      const remainingActivationTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      const remainingResetTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.PASSWORD_RESET,
      });

      expect(remainingActivationTokens).toEqual(0);
      expect(remainingResetTokens).toEqual(2);
    });
  });

  describe('Token handling: Reset', () => {
    it('resetting a password removes all reset tokens, but not activation tokens', async () => {
      const user = await userRepository.save(EntityCreator.createUser());
      const tokenWithHash = await cryptoService.getRandomTokenWithHash();
      const tokenToCheck = EntityCreator.createUserToken(
        user,
        UserTokenType.PASSWORD_RESET,
        tokenWithHash.tokenHash,
        new Date(),
      );

      await userTokenRepository.save([
        tokenToCheck,
        EntityCreator.createUserToken(user, UserTokenType.PASSWORD_RESET),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
      ]);
      const resetRequest: SetNewPasswordDto = {
        userId: user.id,
        token: tokenWithHash.token,
        password: 'gipfeli@Test!123',
        passwordConfirmation: 'gipfeli@Test!123',
      };

      await request(app.getHttpServer())
        .post(`${RoutePrefix.AUTH}/password-reset-set`)
        .send({ ...resetRequest })
        .expect(201);

      const remainingActivationTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      const remainingResetTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.PASSWORD_RESET,
      });

      expect(remainingResetTokens).toEqual(0);
      expect(remainingActivationTokens).toEqual(2);
    });

    it('outdated tokens cannot be used for a password reset', async () => {
      const user = await userRepository.save(EntityCreator.createUser());
      const tokenWithHash = await cryptoService.getRandomTokenWithHash();
      const date = dayjs().subtract(2, 'hours').toDate();
      const tokenToCheck = EntityCreator.createUserToken(
        user,
        UserTokenType.PASSWORD_RESET,
        tokenWithHash.tokenHash,
        date,
      );

      await userTokenRepository.save([
        tokenToCheck,
        EntityCreator.createUserToken(user, UserTokenType.PASSWORD_RESET),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
      ]);
      const resetRequest: SetNewPasswordDto = {
        userId: user.id,
        token: tokenWithHash.token,
        password: 'gipfeli@Test!123',
        passwordConfirmation: 'gipfeli@Test!123',
      };

      await request(app.getHttpServer())
        .post(`${RoutePrefix.AUTH}/password-reset-set`)
        .send({ ...resetRequest })
        .expect(400);

      const remainingActivationTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      const remainingResetTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.PASSWORD_RESET,
      });

      expect(remainingResetTokens).toEqual(2);
      expect(remainingActivationTokens).toEqual(2);
    });

    it('a token that is almost 2 hours old can be used for a password reset', async () => {
      const user = await userRepository.save(EntityCreator.createUser());
      const tokenWithHash = await cryptoService.getRandomTokenWithHash();
      const date = dayjs()
        .subtract(1, 'hour')
        .subtract(59, 'minutes')
        .subtract(59, 'seconds')
        .toDate();
      const tokenToCheck = EntityCreator.createUserToken(
        user,
        UserTokenType.PASSWORD_RESET,
        tokenWithHash.tokenHash,
        date,
      );

      await userTokenRepository.save([
        tokenToCheck,
        EntityCreator.createUserToken(user, UserTokenType.PASSWORD_RESET),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
        EntityCreator.createUserToken(user, UserTokenType.ACCOUNT_ACTIVATION),
      ]);
      const resetRequest: SetNewPasswordDto = {
        userId: user.id,
        token: tokenWithHash.token,
        password: 'gipfeli@Test!123',
        passwordConfirmation: 'gipfeli@Test!123',
      };

      await request(app.getHttpServer())
        .post(`${RoutePrefix.AUTH}/password-reset-set`)
        .send({ ...resetRequest })
        .expect(201);

      const remainingActivationTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.ACCOUNT_ACTIVATION,
      });

      const remainingResetTokens = await userTokenRepository.count({
        userId: user.id,
        tokenType: UserTokenType.PASSWORD_RESET,
      });

      expect(remainingResetTokens).toEqual(0);
      expect(remainingActivationTokens).toEqual(2);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
