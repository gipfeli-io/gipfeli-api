import { SendGridMessageInterface } from './send-grid-message.interface';
import { getTokenizedLinkForUser } from '../../utils/message.helpers';
import { TokenizedMessage } from '../../../enums/tokenized-message';

class SignUpMessage {
  public static getMessage(
    baseUrl: string,
    token: string,
    userId: string,
  ): SendGridMessageInterface {
    const signUpUrl = getTokenizedLinkForUser(
      baseUrl,
      token,
      userId,
      TokenizedMessage.SIGNUP,
    );
    return {
      subject: 'Activate your gipfeli.io account!',
      text: `Hi there!\n\nYou recently signed up on gipfeli.io.Please use the following link to activate your account:\n\n${signUpUrl}\n\nGlad to have you here,\nyour gipfeli.io Team`,
      html: `Hi there!<br><br>You recently signed up on gipfeli.io.<br>Please use the following link to activate your account:<br><br><a href="${signUpUrl}">Activate account</a><br><br>Glad to have you here,<br>your gipfeli.io Team`,
    };
  }
}

export default SignUpMessage;
