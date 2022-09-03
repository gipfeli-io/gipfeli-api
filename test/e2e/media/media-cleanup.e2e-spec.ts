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
import {
  StorageProvider,
  StorageProviderInterface,
  UploadedFileHandle,
} from '../../../src/media/providers/types/storage-provider';
import { AuthService } from '../../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from '../../../src/utils/crypto.service';
import { UserSession } from '../../../src/auth/entities/user-session.entity';
import { UserRole } from '../../../src/user/entities/user.entity';
import { RoutePrefix } from '../utils/route-prefix';
import { Image } from '../../../src/media/entities/image.entity';
import { GpxFile } from '../../../src/media/entities/gpx-file.entity';
import { EntityCreator } from '../utils/entity-creator';
import * as dayjs from 'dayjs';

const fileResponseMock: UploadedFileHandle = {
  identifier: 'mocked-identifier',
  metadata: {},
};

const storageProviderMock: StorageProvider = {
  put: jest.fn().mockReturnValue(fileResponseMock),
  deleteMany: jest.fn(),
};

describe('Media cleanup ', () => {
  let app: INestApplication;
  let tourRepository: Repository<Tour>;
  let imageRepository: Repository<Image>;
  let gpxFileRepository: Repository<GpxFile>;
  const cleanUpToken = process.env.CLEAN_UP_TOKEN;

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
    imageRepository = moduleFixture.get('ImageRepository');
    gpxFileRepository = moduleFixture.get('GpxFileRepository');

    await app.init();
  });

  it('Does not delete media files which are less than 1 day old', async () => {
    const image = await imageRepository.save(
      EntityCreator.createImage(userToCheckAgainst, null, new Date()),
    );
    const gpxFile = await gpxFileRepository.save(
      EntityCreator.createGpxFile(userToCheckAgainst, new Date()),
    );

    await request(app.getHttpServer())
      .get(`${RoutePrefix.MEDIA}/clean-up-media`)
      .set('Authorization', 'Bearer ' + cleanUpToken);

    const imageExists = await imageRepository.count({ id: image.id });
    const gpxFileExists = await gpxFileRepository.count({ id: gpxFile.id });

    expect(imageExists).toEqual(1);
    expect(gpxFileExists).toEqual(1);
  });

  it('Does not delete media files which are exactly 1 second less than a day old', async () => {
    /*
     Even though we use 'LessThan' in our query, because of the time delay of
     generating the entries, using '.subtract(1, 'day')' would lead to their
     removal, because at the time when the tests hit the database query, they
     are already in the past. Because the clean up cut-off time is not critical,
     a certain fuzziness around the exact times is unproblematic.
    */
    const date = dayjs()
      .subtract(23, 'hours')
      .subtract(59, 'minutes')
      .subtract(59, 'seconds')
      .toDate();
    const image = await imageRepository.save(
      EntityCreator.createImage(userToCheckAgainst, null, date),
    );
    const gpxFile = await gpxFileRepository.save(
      EntityCreator.createGpxFile(userToCheckAgainst, date),
    );

    await request(app.getHttpServer())
      .get(`${RoutePrefix.MEDIA}/clean-up-media`)
      .set('Authorization', 'Bearer ' + cleanUpToken);

    const imageExists = await imageRepository.count({ id: image.id });
    const gpxFileExists = await gpxFileRepository.count({ id: gpxFile.id });

    expect(imageExists).toEqual(1);
    expect(gpxFileExists).toEqual(1);
  });

  it('Does delete media files which are exactly 1 day old', async () => {
    const date = dayjs().subtract(1, 'day').toDate();
    const image = await imageRepository.save(
      EntityCreator.createImage(userToCheckAgainst, null, date),
    );
    const gpxFile = await gpxFileRepository.save(
      EntityCreator.createGpxFile(userToCheckAgainst, date),
    );

    await request(app.getHttpServer())
      .get(`${RoutePrefix.MEDIA}/clean-up-media`)
      .set('Authorization', 'Bearer ' + cleanUpToken);

    const imageExists = await imageRepository.count({ id: image.id });
    const gpxFileExists = await gpxFileRepository.count({ id: gpxFile.id });

    expect(imageExists).toEqual(0);
    expect(gpxFileExists).toEqual(0);
  });

  it('Does delete media files which are older than 1 day', async () => {
    const date = dayjs().subtract(1, 'year').toDate();
    const image = await imageRepository.save(
      EntityCreator.createImage(userToCheckAgainst, null, date),
    );
    const gpxFile = await gpxFileRepository.save(
      EntityCreator.createGpxFile(userToCheckAgainst, date),
    );

    await request(app.getHttpServer())
      .get(`${RoutePrefix.MEDIA}/clean-up-media`)
      .set('Authorization', 'Bearer ' + cleanUpToken);

    const imageExists = await imageRepository.count({ id: image.id });
    const gpxFileExists = await gpxFileRepository.count({ id: gpxFile.id });

    expect(imageExists).toEqual(0);
    expect(gpxFileExists).toEqual(0);
  });

  it('Does delete media files without a user regardless of their date', async () => {
    const date = dayjs().toDate();
    const image = await imageRepository.save(
      EntityCreator.createImage(null, null, date),
    );
    const gpxFile = await gpxFileRepository.save(
      EntityCreator.createGpxFile(null, date),
    );

    await request(app.getHttpServer())
      .get(`${RoutePrefix.MEDIA}/clean-up-media`)
      .set('Authorization', 'Bearer ' + cleanUpToken);

    const imageExists = await imageRepository.count({ id: image.id });
    const gpxFileExists = await gpxFileRepository.count({ id: gpxFile.id });

    expect(imageExists).toEqual(0);
    expect(gpxFileExists).toEqual(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
