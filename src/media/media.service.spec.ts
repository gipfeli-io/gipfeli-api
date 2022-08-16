import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import {
  BatchStorageOperationStatistics,
  StorageProvider,
  StorageProviderInterface,
  UploadedFileHandle,
} from './providers/types/storage-provider';
import { AuthenticatedUserDto } from '../user/dto/user';
import { UploadFileDto } from './dto/file';
import { FilePath } from './enums/file-path';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { Image } from './entities/image.entity';
import { DeleteResult, Repository } from 'typeorm';
import {
  GeoReferenceProvider,
  GeoReferenceProviderInterface,
} from './providers/types/geo-reference-provider';
import { Point } from 'geojson';
import { CleanUpResultDto } from './dto/clean-up-result';
import { UserRole } from '../user/entities/user.entity';
import { GpxFile } from './entities/gpx-file.entity';

const fileResponseMock: UploadedFileHandle = {
  identifier: 'mocked-identifier',
  metadata: {},
};

const imageLocationMock: Point = {
  type: 'Point',
  coordinates: [47.37789, 8.53174],
};

const storageProviderMock: StorageProvider = {
  put: jest.fn().mockReturnValue(fileResponseMock),
  deleteMany: jest.fn(),
};

const geoReferenceProviderMock: GeoReferenceProvider = {
  extractGeoLocation: jest.fn().mockReturnValue(imageLocationMock),
};

const userMock: AuthenticatedUserDto = {
  id: 'test-user-id',
  email: 'test@gipfeli.io',
  role: UserRole.USER,
};

const fileMock = {
  mockedFileType: 'this-is-a-mock',
} as unknown as UploadFileDto;

const imageMocks: Image[] = [
  { id: 'mocked-id-1', identifier: 'mocked-identifier-1' },
  { id: 'mocked-id-2', identifier: 'mocked-identifier-2' },
] as Image[];

const gpxFileMocks: GpxFile[] = [
  {
    id: 'mocked-id-gpx-1',
    identifier: 'mocked-gpx-identifier-1',
    name: 'mocked-gpx-name-1',
  },
  {
    id: 'mocked-id-gpx-2',
    identifier: 'mocked-gpx-identifier-2',
    name: 'mocked-gpx-name-2',
  },
] as GpxFile[];

describe('MediaService', () => {
  let mediaService: MediaService;
  let imageRepositoryMock: RepositoryMockType<Repository<Image>>;
  let gpxFileRepositoryMock: RepositoryMockType<Repository<GpxFile>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: StorageProviderInterface,
          useValue: storageProviderMock,
        },
        {
          provide: GeoReferenceProviderInterface,
          useValue: geoReferenceProviderMock,
        },
        {
          provide: getRepositoryToken(Image),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(GpxFile),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    mediaService = module.get<MediaService>(MediaService);
    imageRepositoryMock = module.get(getRepositoryToken(Image));
    gpxFileRepositoryMock = module.get(getRepositoryToken(GpxFile));
  });

  describe('Test image handling', () => {
    describe('uploadImage', () => {
      it('calls storageProvider.put with the correct filepath and file', async () => {
        const spy = jest.spyOn(storageProviderMock, 'put');

        await mediaService.uploadImage(userMock, fileMock);

        const expectedPath = `${FilePath.IMAGE}/${userMock.id}`;
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(expectedPath, fileMock);
      });

      it('calls geoReferenceProvider.extractGeoLocation with the uploaded file', async () => {
        const spy = jest.spyOn(geoReferenceProviderMock, 'extractGeoLocation');

        await mediaService.uploadImage(userMock, fileMock);

        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(fileMock);
      });

      it('saves the image to the database and assigns it a user', async () => {
        await mediaService.uploadImage(userMock, fileMock);

        const expectedCallArgument = {
          identifier: fileResponseMock.identifier,
          location: imageLocationMock,
          userId: userMock.id,
        };

        expect(imageRepositoryMock.create).toHaveBeenCalledTimes(1);
        expect(imageRepositoryMock.save).toHaveBeenCalledTimes(1);
        expect(imageRepositoryMock.create).toHaveBeenCalledWith(
          expectedCallArgument,
        );
        expect(imageRepositoryMock.save).toHaveBeenCalledWith(
          expectedCallArgument,
        );
      });

      it('returns the image id and filehandle', async () => {
        const imageMock = imageMocks[0];
        jest.spyOn(imageRepositoryMock, 'save').mockReturnValue(imageMock);

        const result = await mediaService.uploadImage(userMock, fileMock);

        const expectedResult = { location: imageLocationMock, ...imageMock };
        expect(result).toEqual(expectedResult);
      });
    });
  });

  describe('Test GPX File Upload handling', () => {
    describe('uploadGpxFile', () => {
      it('calls storageProvider.put with the correct filepath and file', async () => {
        const spy = jest.spyOn(storageProviderMock, 'put');

        await mediaService.uploadGpxFile(userMock, fileMock);

        const expectedPath = `${FilePath.GPX_FILES}/${userMock.id}`;
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(expectedPath, fileMock);
      });

      it('saves the gpx file to the database and assigns it a user', async () => {
        await mediaService.uploadGpxFile(userMock, fileMock);

        const expectedCallArgument = {
          identifier: fileResponseMock.identifier,
          user: { id: userMock.id },
        };

        expect(gpxFileRepositoryMock.create).toHaveBeenCalledTimes(1);
        expect(gpxFileRepositoryMock.save).toHaveBeenCalledTimes(1);
        expect(gpxFileRepositoryMock.create).toHaveBeenCalledWith(
          expectedCallArgument,
        );
        expect(gpxFileRepositoryMock.save).toHaveBeenCalledWith(
          expectedCallArgument,
        );
      });

      it('returns the gpx file id and file handle', async () => {
        const gpxFileMock = gpxFileMocks[0];
        jest.spyOn(gpxFileRepositoryMock, 'save').mockReturnValue(gpxFileMock);

        const result = await mediaService.uploadGpxFile(userMock, fileMock);

        expect(result).toEqual(gpxFileMock);
      });
    });
  });

  describe('cleanUpMedia', () => {
    const spyOnImageRepositoryMock = (deleteResponseDb: DeleteResult) => {
      jest.spyOn(imageRepositoryMock, 'find').mockReturnValue(imageMocks);
      jest
        .spyOn(imageRepositoryMock, 'delete')
        .mockReturnValue(deleteResponseDb);
    };

    const spyOnGxpFileRepositoryMock = (deleteResponseDb: DeleteResult) => {
      gpxFileRepositoryMock.createQueryBuilder.mockImplementation(() => {
        return {
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockReturnValueOnce(gpxFileMocks),
        };
      });
      jest
        .spyOn(gpxFileRepositoryMock, 'delete')
        .mockReturnValue(deleteResponseDb);
    };

    it('retrieves media to delete and deletes it from storage and db and returns the statistics', async () => {
      const imageIdentifiers = imageMocks.map((image) => image.identifier);
      const imageIds = imageMocks.map((image) => image.id);

      const gpxFileIdentifiers = gpxFileMocks.map(
        (gpxFile) => gpxFile.identifier,
      );
      const gpxFileIds = gpxFileMocks.map((gpxFile) => gpxFile.id);

      const deleteResponseDb: DeleteResult = {
        affected: imageMocks.length + gpxFileMocks.length,
        raw: null,
      };
      const deleteResponseStorage: BatchStorageOperationStatistics = {
        totalOperations: imageMocks.length + gpxFileMocks.length,
        successfulOperations: imageMocks.length + gpxFileMocks.length,
        errors: [],
      };

      spyOnImageRepositoryMock(deleteResponseDb);
      spyOnGxpFileRepositoryMock(deleteResponseDb);

      jest
        .spyOn(storageProviderMock, 'deleteMany')
        .mockReturnValue(Promise.resolve(deleteResponseStorage));

      const result = await mediaService.cleanUpMedia();

      const expectedResult = new CleanUpResultDto(
        deleteResponseDb,
        deleteResponseStorage,
      );

      expect(result).toEqual(expectedResult);
      expect(storageProviderMock.deleteMany).toHaveBeenCalledTimes(2);

      // check image results
      expect(storageProviderMock.deleteMany).toHaveBeenCalledWith(
        imageIdentifiers,
      );
      expect(imageRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(imageRepositoryMock.delete).toHaveBeenCalledWith(imageIds);

      // check gpx file results
      expect(storageProviderMock.deleteMany).toHaveBeenCalledWith(
        gpxFileIdentifiers,
      );
      expect(gpxFileRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(gpxFileRepositoryMock.delete).toHaveBeenCalledWith(gpxFileIds);
    });
  });
  afterEach(() => jest.clearAllMocks());
});
