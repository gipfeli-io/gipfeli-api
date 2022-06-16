import { SendGridMessageInterface } from './send-grid-message.interface';
import { getUserActivationUrl } from '../../utils/message.helpers';

class SignUpMessage {
  public static getMessage(
    token: string,
    userId: string,
  ): SendGridMessageInterface {
    const signUpUrl = getUserActivationUrl(token, userId)
    return {
      subject: 'Activate your gipfeli.io account!',
      text: `Hi there!\nYou recently signed up on gipfeli.io.Please use the following link to activate your account:\n\n${signUpUrl}\n\nGlad to have you here,\nyour gipfeli.io Team`,
      html: `Hi there!<br>You recently signed up on gipfeli.io.<br>Please use the following link to activate your account:<br><br><a href="${signUpUrl}">Activate account<br><br>Glad to have you here,<br>your gipfeli.io Team`,
    };
  }
}

export default SignUpMessage;
