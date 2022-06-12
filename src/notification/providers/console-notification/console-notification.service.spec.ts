import { ConsoleNotificationService } from './console-notification.service';

describe('ConsoleNotificationService', () => {
  let service: ConsoleNotificationService;
  beforeEach(() => {
    service = new ConsoleNotificationService();
  });

  describe('sendDebugMessage', () => {
    it('prints a debug message', async () => {
      const logSpy = jest.spyOn(console, 'log');
      const message = 'test-message';
      const recipient = { name: 'debug', email: 'a@a.com' };

      service.sendDebugMessage(message, recipient);

      expect(logSpy).toHaveBeenCalledTimes(3);
      expect(logSpy.mock.calls[1][0]).toContain(recipient.email);
      expect(logSpy.mock.calls[1][0]).toContain(recipient.name);
      expect(logSpy.mock.calls[2][0]).toContain(message);
    });
  });

  describe('sendSignUpMessage', () => {
    it('prints a signup message', async () => {
      const logSpy = jest.spyOn(console, 'log');
      const token = 'xyz';
      const userDto = {
        id: 'x-x-x',
        firstName: 'debug',
        lastName: 'debugLast',
        password: 'x',
        email: 'a@a.com',
      };

      service.sendSignUpMessage(token, userDto);

      expect(logSpy).toHaveBeenCalledTimes(4);
      expect(logSpy.mock.calls[1][0]).toContain(userDto.email);
      expect(logSpy.mock.calls[1][0]).toContain(userDto.firstName);
      expect(logSpy.mock.calls[1][0]).toContain(userDto.lastName);
      expect(logSpy.mock.calls[2][0]).toContain(userDto.id);
      expect(logSpy.mock.calls[3][0]).toContain(token);
    });
  });
});
