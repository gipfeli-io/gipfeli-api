import { SendGridMessageInterface } from './send-grid-message.interface';

class DebugMessage {
  public static getMessage(message: string): SendGridMessageInterface {
    return {
      subject: 'Debug Message sent from gipfeli.io',
      text: message,
      html: `<strong>${message}</strong>`,
    };
  }
}

export default DebugMessage;
