import { SendGridNotificationService } from './send-grid-notification.service';
import * as SendGrid from '@sendgrid/mail';
import DebugMessage from './messages/debug.message';
import SignUpMessage from './messages/sign-up.message';
import { UserDto } from '../../../user/dto/user';

jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: jest.fn(),
    send: jest.fn(),
  };
});

const defaultSender = 'x@x.com';

describe('SendGridNotificationService', () => {
  let service: SendGridNotificationService;
  beforeEach(() => {
    process.env.SENDGRID_SENDER = defaultSender;
    service = new SendGridNotificationService();
  });

  describe('sendDebugMessage', () => {
    it('sends a debug message', async () => {
      const message = 'test-message';
      const recipient = { name: 'debug', email: 'a@a.com' };
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
  });

  describe('sendSignUpMessage', () => {
    it('sends a debug message', async () => {
      const token = 'test-token';
      const recipient = { email: 'test@gipfeli.io', id: 'xxx' } as UserDto;
      const debugMessage = SignUpMessage.getMessage(token, recipient.id);

      await service.sendSignUpMessage(token, recipient);

      expect(SendGrid.send).toHaveBeenCalledTimes(1);
      expect(SendGrid.send).toHaveBeenCalledWith({
        to: recipient.email,
        html: debugMessage.html,
        subject: debugMessage.subject,
        text: debugMessage.text,
        from: defaultSender,
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
