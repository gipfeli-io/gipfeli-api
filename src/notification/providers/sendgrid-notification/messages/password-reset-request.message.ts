import { SendGridMessageInterface } from './send-grid-message.interface';
import { getTokenizedLinkForUser } from '../../utils/message.helpers';
import { TokenizedMessage } from '../../../enums/tokenized-message';

class PasswordResetRequestMessage {
  public static getMessage(
    baseUrl: string,
    token: string,
    userId: string,
  ): SendGridMessageInterface {
    const resetUrl = getTokenizedLinkForUser(
      baseUrl,
      token,
      userId,
      TokenizedMessage.PASSWORD_RESET,
    );
    return {
      subject: 'Reset your gipfeli.io password',
      text: `Hi there!\n\nYou (or someone  else) has just requested to reset your password. Please use the following link to reset your password:\n\n${resetUrl}\n\nNote that this link is only valid for 2 hours. If you have not requested to reset your password, someone else did and you can ignore this email.\n\nGlad to have you here,\nyour gipfeli.io Team`,
      html: `Hi there!<br><br>You (or someone  else) has just requested to reset your password. Please use the following link to reset your password:<br><br><a href="${resetUrl}">Reset password</a><br><br>Note that this link is only valid for 2 hours. If you have not requested to reset your password, someone else did and you can ignore this email.<br><br>Glad to have you here,<br>your gipfeli.io Team`,
    };
  }
}

export default PasswordResetRequestMessage;
