import { Injectable } from '@nestjs/common';
import {
  NotificationRecipient,
  NotificationService,
} from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';
import * as SendGrid from '@sendgrid/mail';
import debugMessage from './messages/debug.message';
import { EmailNotSent } from './send-grid-notification.exceptions';
import DebugMessage from './messages/debug.message';
import SignUpMessage from './messages/sign-up.message';

@Injectable()
export class SendGridNotificationService implements NotificationService {
  private readonly sender: string = process.env.SENDGRID_SENDER;

  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendDebugMessage(
    message: string,
    recipient: NotificationRecipient,
  ): Promise<boolean> {
    const content = DebugMessage.getMessage(message);
    const emailBody: SendGrid.MailDataRequired = {
      to: recipient.email,
      from: this.sender,
      ...content,
    };
    await this.dispatchEmail(emailBody);
    return true;
  }

  async sendSignUpMessage(token: string, recipient: UserDto): Promise<boolean> {
    const content = SignUpMessage.getMessage(token, recipient.id);
    const emailBody: SendGrid.MailDataRequired = {
      to: recipient.email,
      from: this.sender,
      ...content,
    };
    await this.dispatchEmail(emailBody);
    return true;
  }

  private async dispatchEmail(emailBody: SendGrid.MailDataRequired) {
    try {
      const result = await SendGrid.send(emailBody);
      return true;
    } catch (error) {
      throw new EmailNotSent();
    }
  }

  private extractRecipientFromUser(user: UserDto): NotificationRecipient {
    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }
}
