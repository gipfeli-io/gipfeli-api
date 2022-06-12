import { SendGridMessageInterface } from './send-grid-message.interface';

const debugMessage: SendGridMessageInterface = {
  subject: 'Debug Message sent from gipfeli.io',
  text: 'This is a debug message sent from gipfeli.io',
  html: '<strong>This debug message is in bold.</strong>',
};

export default debugMessage;
