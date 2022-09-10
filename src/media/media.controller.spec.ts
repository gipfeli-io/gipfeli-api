import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageProviderInterface } from './providers/types/storage-provider';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { UploadFileDto } from './dto/file.dto';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { UserRole } from '../user/entities/user.entity';

const mediaServiceMock = {
  uploadImage: jest.fn(),
  cleanUpMedia: jest.fn(),
  uploadGpxFile: jest.fn(),
};

const notificationServiceMock = {
  sendCleanUpResults: jest.fn(),
};

describe('MediaController', () => {
  let mediaController: MediaController;
  let mediaService: MediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MediaController],
      providers: [
        { provide: MediaService, useValue: mediaServiceMock },
        {
          provide: NotificationServiceInterface,
          useValue: notificationServiceMock,
        },
      ],
    })
      .useMocker((token) => {
        if (token === StorageProviderInterface) {
          return jest.fn();
        }
      })
      .compile();

    mediaController = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  describe('uploadImage', () => {
    it('calls mediaService.uploadimage with the file and the usersession', async () => {
      const spy = jest.spyOn(mediaService, 'uploadImage');
      const userMock: AuthenticatedUserDto = {
        id: 'test',
        email: 'test@gipfeli.io',
        role: UserRole.USER,
      };
      const fileMock = {
        mockedFileType: 'this-is-a-mock',
      } as unknown as UploadFileDto;

      await mediaController.uploadImage(userMock, fileMock);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(userMock, fileMock);
    });
  });

  describe('uploadGpxFile', () => {
    it('calls mediaService.uploadGpxFile with the file and the usersession', async () => {
      const spy = jest.spyOn(mediaService, 'uploadGpxFile');
      const userMock: AuthenticatedUserDto = {
        id: 'test',
        email: 'test@gipfeli.io',
        role: UserRole.USER,
      };
      const fileMock = {
        mockedFileType: 'this-is-a-mock',
      } as unknown as UploadFileDto;

      await mediaController.uploadGpxFile(userMock, fileMock);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(userMock, fileMock);
    });
  });

  describe('cleanUpMedia', () => {
    it('calls mediaService.cleanUpMedia ', async () => {
      const mediaServiceSpy = jest.spyOn(mediaService, 'cleanUpMedia');
      const notificationProviderSpy = jest.spyOn(
        notificationServiceMock,
        'sendCleanUpResults',
      );

      await mediaController.cleanUpMedia();

      expect(mediaServiceSpy).toHaveBeenCalledTimes(1);
      expect(notificationProviderSpy).toHaveBeenCalledTimes(1);
    });
  });
});
