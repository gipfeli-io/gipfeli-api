import { Injectable } from '@nestjs/common';
import {
  NotificationRecipient,
  NotificationService,
} from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';
import * as SendGrid from '@sendgrid/mail';
import debugMessage from './messages/debug.message';

@Injectable()
export class SendGridNotificationService implements NotificationService {
  private readonly sender: string = process.env.SENDGRID_SENDER;
  constructor() {
    SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
  }

  sendDebugMessage(message: string, recipient: NotificationRecipient): boolean {
    const content = debugMessage;
    const emailBody: SendGrid.MailDataRequired = {
      to: recipient.email,
      from: this.sender,
      ...content,
    };

    this.dispatchEmail(emailBody);

    return true;
  }

  sendSignUpMessage(token: string, recipient: UserDto): boolean {
    return true;
  }

  private dispatchEmail(emailBody: SendGrid.MailDataRequired) {
    SendGrid.send(emailBody)
      .then((response) => {
        console.log(response[0].statusCode);
        console.log(response[0].headers);
      })
      .catch((error) => {
        console.error(error.response.body);
      });
  }

  private extractRecipientFromUser(user: UserDto): NotificationRecipient {
    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }
}
