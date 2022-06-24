import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { GoogleCloudStorageProvider } from './google-cloud-storage-provider';
import { UploadFileDto } from '../../dto/file';
import * as crypto from 'crypto';
import { UploadedFileHandle } from '../types/storage-provider';
import { GoogleCloudStorageException } from './google-cloud-storage-provider.exceptions';

const mockedBucket = {
  file: jest.fn((destination: string) => ({
    name: destination,
    save: jest.fn(),
  })),
};

const mockedStorage = {
  bucket: jest.fn(() => mockedBucket),
};

jest.mock('@google-cloud/storage', () => {
  return {
    Storage: jest.fn(() => mockedStorage),
  };
});

describe('GoogleCloudStorageProvider', () => {
  let gcsProvider: GoogleCloudStorageProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleCloudStorageProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(() => {
              return 'default value';
            }),
          },
        },
      ],
    }).compile();

    gcsProvider = module.get<GoogleCloudStorageProvider>(
      GoogleCloudStorageProvider,
    );
  });

  describe('put', () => {
    it('uploads the file with the correct path and filename and returns its handle and metadata property', async () => {
      const mockedUuid = 'x-x-x-x';
      jest.spyOn(crypto, 'randomUUID').mockReturnValue(mockedUuid);
      const spy = jest.spyOn(mockedBucket, 'file');
      const mockPath = 'test-path/test-sub-path';
      const fileMock = {
        originalname: 'this-is-a-mock',
      } as unknown as UploadFileDto;

      const result = await gcsProvider.put(mockPath, fileMock);

      const expectedFilePath = `${mockPath}/${mockedUuid}_${fileMock.originalname}`;
      const expectedResult: UploadedFileHandle = {
        identifier: expectedFilePath,
        metadata: undefined, // This is undefined, because we're mocking the upload.
      };
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expectedFilePath);
      expect(result).toEqual(expectedResult);
    });

    it('raises GoogleCloudStorageException if save fails', async () => {
      const mockPath = 'test-path/test-sub-path';
      const fileMock = {
        originalname: 'this-is-a-mock',
      } as unknown as UploadFileDto;
      jest.spyOn(mockedBucket, 'file').mockImplementation(() => ({
        name: 'destination',
        save: jest.fn(() => {
          throw new Error();
        }),
      }));

      const result = async () => gcsProvider.put(mockPath, fileMock);

      await expect(result).rejects.toThrow(GoogleCloudStorageException);
    });
  });
});
