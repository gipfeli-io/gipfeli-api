import { SendGridNotificationService } from './send-grid-notification.service';
import * as SendGrid from '@sendgrid/mail';
import DebugMessage from './messages/debug.message';
import SignUpMessage from './messages/sign-up.message';
import { UserDto } from '../../../user/dto/user';
import { EmailNotSent } from '../../notification.exceptions';

jest.mock('@sendgrid/mail', () => {
  return {
    setApiKey: jest.fn(),
    send: jest.fn(),
  };
});

const defaultSender = 'x@x.com';
const recipient = { email: 'test@gipfeli.io', id: 'xxx', name: 'Test Person' };

describe('SendGridNotificationService', () => {
  let service: SendGridNotificationService;
  beforeEach(() => {
    process.env.SENDGRID_SENDER = defaultSender;
    service = new SendGridNotificationService();
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
    const signupMessage = SignUpMessage.getMessage(token, recipient.id);

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

  it('raises an EmailNotSent if email cannot be sent due to client failing', async () => {
    jest.spyOn(SendGrid, 'send').mockImplementation(() => {
      throw new Error();
    });

    const result = async () => await service.sendDebugMessage('', recipient);

    await expect(result).rejects.toThrow(EmailNotSent);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
