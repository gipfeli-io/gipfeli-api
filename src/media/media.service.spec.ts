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
import { CleanUpResult } from './types/clean-up-result';

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
};

const fileMock = {
  mockedFileType: 'this-is-a-mock',
} as unknown as UploadFileDto;

const imageMocks: Image[] = [
  { id: 'mocked-id-1', identifier: 'mocked-identifier-1' },
  { id: 'mocked-id-2', identifier: 'mocked-identifier-2' },
] as Image[];

describe('MediaService', () => {
  let mediaService: MediaService;
  let imageRepositoryMock: RepositoryMockType<Repository<Image>>;

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
      ],
    }).compile();

    mediaService = module.get<MediaService>(MediaService);
    imageRepositoryMock = module.get(getRepositoryToken(Image));
  });

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

  describe('cleanUpImages', () => {
    it('retrieves images to delete and deletes them from storage and db and returns the statistics', async () => {
      const imageIdentifiers = imageMocks.map((image) => image.identifier);
      const imageIds = imageMocks.map((image) => image.id);
      const deleteResponseDb: DeleteResult = {
        affected: imageMocks.length,
        raw: null,
      };
      const deleteResponseStorage: BatchStorageOperationStatistics = {
        totalOperations: imageMocks.length,
        successfulOperations: imageMocks.length,
        errors: [],
      };
      jest.spyOn(imageRepositoryMock, 'find').mockReturnValue(imageMocks);
      jest
        .spyOn(imageRepositoryMock, 'delete')
        .mockReturnValue(deleteResponseDb);
      jest
        .spyOn(storageProviderMock, 'deleteMany')
        .mockReturnValue(Promise.resolve(deleteResponseStorage));

      const result = await mediaService.cleanUpImages();

      const expectedResult: CleanUpResult = {
        storage: deleteResponseStorage,
        database: deleteResponseDb,
      };
      expect(result).toEqual(expectedResult);
      expect(storageProviderMock.deleteMany).toHaveBeenCalledTimes(1);
      expect(storageProviderMock.deleteMany).toHaveBeenCalledWith(
        imageIdentifiers,
      );
      expect(imageRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(imageRepositoryMock.delete).toHaveBeenCalledWith(imageIds);
    });

    it('calls storageProvider.deleteMany but not imageRepository.delete if no images are to be deleted to avoid exception', async () => {
      jest.spyOn(imageRepositoryMock, 'find').mockReturnValue([]);

      const result = await mediaService.cleanUpImages();

      expect(storageProviderMock.deleteMany).toHaveBeenCalledTimes(1);
      expect(storageProviderMock.deleteMany).toHaveBeenCalledWith([]);
      expect(imageRepositoryMock.delete).not.toHaveBeenCalled();
      expect(result.database.affected).toEqual(0);
    });
  });

  afterEach(() => jest.clearAllMocks());
});
