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
import { CleanUpResultDto } from '../../../media/dto/clean-up-result';
import CleanUpNotificationMessage from './messages/clean-up-notification.message';
import { SendGridMessageInterface } from './messages/send-grid-message.interface';
import PasswordResetRequestMessage from './messages/password-reset-request.message';

@Injectable()
export class SendGridNotificationService implements NotificationService {
  private readonly sender: string;
  private readonly baseUrl: string;
  private readonly adminContacts: NotificationRecipient[];

  constructor(private readonly configService: ConfigService) {
    this.sender = this.configService.get<string>(
      'integrations.sendGrid.sender',
    );
    this.baseUrl = this.configService.get<string>('environment.appUrl');
    this.adminContacts = this.configService.get<NotificationRecipient[]>(
      'environment.adminContacts',
    );
    const apiKey = this.configService.get<string>(
      'integrations.sendGrid.apiKey',
    );
    SendGrid.setApiKey(apiKey);
  }

  async sendPasswordResetRequestMessage(
    token: string,
    recipient: UserDto,
  ): Promise<boolean> {
    const content = PasswordResetRequestMessage.getMessage(
      this.baseUrl,
      token,
      recipient.id,
    );
    const emailBody = this.getEmailBody(recipient.email, content);
    await this.dispatchEmail(emailBody);
    return true;
  }

  async sendCleanUpResults(results: CleanUpResultDto): Promise<boolean> {
    const content = CleanUpNotificationMessage.getMessage(results);
    const recipients = this.adminContacts.map((contact) => contact.email);
    const emailBody = this.getEmailBody(recipients, content);

    await this.dispatchEmail(emailBody);

    return true;
  }

  async sendDebugMessage(
    message: string,
    recipient: NotificationRecipient,
  ): Promise<boolean> {
    const content = DebugMessage.getMessage(message);
    const emailBody = this.getEmailBody(recipient.email, content);
    await this.dispatchEmail(emailBody);
    return true;
  }

  async sendSignUpMessage(token: string, recipient: UserDto): Promise<boolean> {
    const content = SignUpMessage.getMessage(this.baseUrl, token, recipient.id);
    const emailBody = this.getEmailBody(recipient.email, content);
    await this.dispatchEmail(emailBody);
    return true;
  }

  private getEmailBody(
    recipient: string | string[],
    content: SendGridMessageInterface,
  ): SendGrid.MailDataRequired {
    return {
      to: recipient,
      from: this.sender,
      ...content,
    };
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
