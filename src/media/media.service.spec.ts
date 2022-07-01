import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import {
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
import { Repository } from 'typeorm';
import spyOn = jest.spyOn;

const fileResponseMock: UploadedFileHandle = {
  identifier: 'mocked-identifier',
  metadata: {},
};

const storageProviderMock = {
  put: jest.fn().mockReturnValue(fileResponseMock),
};

const userMock: AuthenticatedUserDto = {
  id: 'test-user-id',
  email: 'test@gipfeli.io',
};
const fileMock = {
  mockedFileType: 'this-is-a-mock',
} as unknown as UploadFileDto;

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

    it('saves the image to the database and assigns it a user', async () => {
      await mediaService.uploadImage(userMock, fileMock);

      const expectedCallArgument = {
        identifier: fileResponseMock.identifier,
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
      const imageMock = { id: 'mocked-id', identifier: 'mocked-identifier' };
      jest.spyOn(imageRepositoryMock, 'save').mockReturnValue(imageMock);

      const result = await mediaService.uploadImage(userMock, fileMock);

      expect(result).toEqual(imageMock);
    });
  });
});
