import { Test, TestingModule } from '@nestjs/testing';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { AppController } from './app.controller';
import * as httpMocks from 'node-mocks-http';

const notificationServiceMock = {
  sendDebugMessage: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: NotificationServiceInterface,
          useValue: notificationServiceMock,
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('robots.txt', () => {
    it('returns the robots.txt content', async () => {
      const response = httpMocks.createResponse();

      appController.getRobotsTxt(response);

      expect(response.getHeader('content-type')).toEqual('text/plain');
      expect(response._getData()).toEqual('User-agent: *\nDisallow: /');
    });
  });

  describe('debug-msg', () => {
    it('dispatches a debug message to Mister Debug', async () => {
      const recipient = { name: 'Mister Debug', email: 'debug@gipfeli.io' };
      const message = 'This is a test message.';

      await appController.debugMsg();

      expect(notificationServiceMock.sendDebugMessage).toHaveBeenCalledTimes(1);
      expect(notificationServiceMock.sendDebugMessage).toHaveBeenCalledWith(
        message,
        recipient,
      );
    });
  });
});
