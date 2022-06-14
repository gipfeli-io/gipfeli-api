import { SendGridMessageInterface } from './send-grid-message.interface';

class SignUpMessage {
  public static getMessage(
    token: string,
    userId: string,
  ): SendGridMessageInterface {
    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    return {
      subject: 'Activate your gipfeli.io account!',
      text: `Hi there!\nYou recently signed up on gipfeli.io.Please use the following link to activate your account:\n\n${baseUrl}user/activate/${userId}/${token}\n\nGlad to have you here,\nyour gipfeli.io Team`,
      html: `Hi there!<br>You recently signed up on gipfeli.io.<br>Please use the following link to activate your account:<br><br><a href="${baseUrl}user/activate/${userId}/${token}">Activate account<br><br>Glad to have you here,<br>your gipfeli.io Team`,
    };
  }
}

export default SignUpMessage;
