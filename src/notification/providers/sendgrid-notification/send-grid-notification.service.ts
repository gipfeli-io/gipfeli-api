import { Injectable } from '@nestjs/common';
import {
  NotificationRecipient,
  NotificationService,
} from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';
import * as SendGrid from '@sendgrid/mail';
import DebugMessage from './messages/debug.message';
import { EmailNotSentException } from '../../notification.exceptions';
import SignUpMessage from './messages/sign-up.message';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SendGridNotificationService implements NotificationService {
  private readonly sender: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.sender = this.configService.get<string>(
      'integrations.sendGrid.sender',
    );
    this.baseUrl = this.configService.get<string>('environment.appUrl');
    const apiKey = this.configService.get<string>(
      'integrations.sendGrid.apiKey',
    );
    SendGrid.setApiKey(apiKey);
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
    const content = SignUpMessage.getMessage(this.baseUrl, token, recipient.id);
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
      await SendGrid.send(emailBody);
      return true;
    } catch (error) {
      throw new EmailNotSentException();
    }
  }
}
