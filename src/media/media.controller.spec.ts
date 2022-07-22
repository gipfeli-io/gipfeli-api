import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { StorageProviderInterface } from './providers/types/storage-provider';
import { AuthenticatedUserDto } from '../user/dto/user';
import { UploadFileDto } from './dto/file';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { UserRole } from '../user/entities/user.entity';

const mediaServiceMock = {
  uploadImage: jest.fn(),
  cleanUpImages: jest.fn(),
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

  describe('cleanUpImages', () => {
    it('calls mediaService.uploadimage with the file and the usersession', async () => {
      const mediaServiceSpy = jest.spyOn(mediaService, 'cleanUpImages');
      const notificationProviderSpy = jest.spyOn(
        notificationServiceMock,
        'sendCleanUpResults',
      );

      await mediaController.cleanUpImages();

      expect(mediaServiceSpy).toHaveBeenCalledTimes(1);
      expect(notificationProviderSpy).toHaveBeenCalledTimes(1);
    });
  });
});
