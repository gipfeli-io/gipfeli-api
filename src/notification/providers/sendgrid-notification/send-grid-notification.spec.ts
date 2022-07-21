import { SendGridNotificationService } from './send-grid-notification.service';
import * as SendGrid from '@sendgrid/mail';
import DebugMessage from './messages/debug.message';
import SignUpMessage from './messages/sign-up.message';
import { UserDto } from '../../../user/dto/user';
import { EmailNotSentException } from '../../notification.exceptions';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import CleanUpNotificationMessage from './messages/clean-up-notification.message';
import { CleanUpResultDto } from '../../../media/dto/clean-up-result';
import { NotificationRecipient } from '../../types/notification-service';

jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: jest.fn(),
    send: jest.fn(),
  };
});

const defaultBaseUrl = 'https://test.gipfeli.io';
const defaultSender = 'x@x.com';
const recipient = { email: 'test@gipfeli.io', id: 'xxx', name: 'Test Person' };
const adminRecipients: NotificationRecipient[] = [
  { email: 'test@gipfeli.io' },
  { email: 'test+dev@gipfeli.io' },
];
describe('SendGridNotificationService', () => {
  let service: SendGridNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendGridNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'integrations.sendGrid.sender') {
                return defaultSender;
              }
              if (key === 'environment.appUrl') {
                return defaultBaseUrl;
              }
              if (key === 'environment.adminContacts') {
                return adminRecipients;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SendGridNotificationService>(
      SendGridNotificationService,
    );
  });

  it('sends a debug message', async () => {
    const message = 'test-message';
    const debugMessage = DebugMessage.getMessage(message);

    await service.sendDebugMessage(message, recipient);

    expect(SendGrid.send).toHaveBeenCalledTimes(1);
    expect(SendGrid.send).toHaveBeenCalledWith({
      to: recipient.email,
      html: debugMessage.html,
      subject: debugMessage.subject,
      text: debugMessage.text,
      from: defaultSender,
    });
  });

  it('sends a signup message', async () => {
    const token = 'test-token';
    const recipient = { email: 'test@gipfeli.io', id: 'xxx' } as UserDto;
    const signupMessage = SignUpMessage.getMessage(
      defaultBaseUrl,
      token,
      recipient.id,
    );

    await service.sendSignUpMessage(token, recipient);

    expect(SendGrid.send).toHaveBeenCalledTimes(1);
    expect(SendGrid.send).toHaveBeenCalledWith({
      to: recipient.email,
      html: signupMessage.html,
      subject: signupMessage.subject,
      text: signupMessage.text,
      from: defaultSender,
    });
  });

  it('sends a cleanupnotification message', async () => {
    const results = new CleanUpResultDto();

    const notificationMessage = CleanUpNotificationMessage.getMessage(results);

    await service.sendCleanUpResults(results);

    expect(SendGrid.send).toHaveBeenCalledTimes(1);
    expect(SendGrid.send).toHaveBeenCalledWith({
      to: adminRecipients.map((admin) => admin.email),
      html: notificationMessage.html,
      subject: notificationMessage.subject,
      text: notificationMessage.text,
      from: defaultSender,
    });
  });

  it('raises an EmailNotSent if email cannot be sent due to client failing', async () => {
    jest.spyOn(SendGrid, 'send').mockImplementation(() => {
      throw new Error();
    });

    const result = async () => service.sendDebugMessage('', recipient);

    await expect(result).rejects.toThrow(EmailNotSentException);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
