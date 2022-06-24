import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { StorageProviderInterface } from './providers/types/storage-provider';
import { AuthenticatedUserDto } from '../user/dto/user';
import { UploadFileDto } from './dto/file';
import { FilePath } from './enums/file-path';

const storageProviderMock = {
  put: jest.fn(),
};

describe('MediaService', () => {
  let mediaService: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        {
          provide: StorageProviderInterface,
          useValue: storageProviderMock,
        },
      ],
    }).compile();

    mediaService = module.get<MediaService>(MediaService);
  });

  describe('uploadImage', () => {
    it('calls storageProvider.put with the correct filepath and file', () => {
      const spy = jest.spyOn(storageProviderMock, 'put');
      const userMock: AuthenticatedUserDto = {
        id: 'test-user-id',
        email: 'test@gipfeli.io',
      };
      const fileMock = {
        mockedFileType: 'this-is-a-mock',
      } as unknown as UploadFileDto;

      mediaService.uploadImage(userMock, fileMock);

      const expectedPath = `${FilePath.IMAGE}/${userMock.id}`;
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expectedPath, fileMock);
    });
  });
});
