import { Injectable } from '@nestjs/common';
import {
  NotificationRecipient,
  NotificationService,
} from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';
import { getUserActivationUrl } from '../utils/message.helpers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConsoleNotificationService implements NotificationService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('environment.appUrl');
  }

  async sendDebugMessage(
    message: string,
    recipient: NotificationRecipient,
  ): Promise<boolean> {
    console.log('sendDebugMessage:');
    this.printRecipient(recipient);
    console.log(`=> Message: ${message}`);

    return Promise.resolve(true);
  }

  async sendSignUpMessage(token: string, recipient: UserDto): Promise<boolean> {
    const { id } = recipient;
    console.log('sendSignUpMessage:');
    this.printRecipient(this.extractRecipientFromUser(recipient));
    console.log(`=> userId: ${id}`);
    console.log(`=> token: ${token}`);
    console.log(
      `=> SignUpLink: ${getUserActivationUrl(this.baseUrl, token, id)}`,
    );

    return Promise.resolve(true);
  }

  private printRecipient(recipient: NotificationRecipient) {
    console.log(`=> Recipient: ${recipient.name} (${recipient.email})`);
  }

  private extractRecipientFromUser(user: UserDto): NotificationRecipient {
    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    };
  }
}
