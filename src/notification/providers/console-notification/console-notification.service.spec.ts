import { ConsoleNotificationService } from './console-notification.service';

describe('ConsoleNotificationService', () => {
  let service: ConsoleNotificationService;
  let logSpy;
  beforeEach(() => {
    service = new ConsoleNotificationService();
    logSpy = jest.spyOn(console, 'log');
  });

  it('prints a debug message', async () => {
    const message = 'test-message';
    const recipient = { name: 'debug', email: 'a@a.com' };

    await service.sendDebugMessage(message, recipient);

    expect(logSpy).toHaveBeenCalledTimes(3);
    expect(logSpy.mock.calls[1][0]).toContain(recipient.email);
    expect(logSpy.mock.calls[1][0]).toContain(recipient.name);
    expect(logSpy.mock.calls[2][0]).toContain(message);
  });

  it('prints a signup message', async () => {
    const token = 'xyz';
    const userDto = {
      id: 'x-x-x',
      firstName: 'debug',
      lastName: 'debugLast',
      password: 'x',
      email: 'a@a.com',
    };

    await service.sendSignUpMessage(token, userDto);

    expect(logSpy).toHaveBeenCalledTimes(4);
    expect(logSpy.mock.calls[1][0]).toContain(userDto.email);
    expect(logSpy.mock.calls[1][0]).toContain(userDto.firstName);
    expect(logSpy.mock.calls[1][0]).toContain(userDto.lastName);
    expect(logSpy.mock.calls[2][0]).toContain(userDto.id);
    expect(logSpy.mock.calls[3][0]).toContain(token);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
