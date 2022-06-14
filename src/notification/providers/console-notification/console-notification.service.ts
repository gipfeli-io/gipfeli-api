import { Injectable } from '@nestjs/common';
import {
  NotificationRecipient,
  NotificationService,
} from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';

@Injectable()
export class ConsoleNotificationService implements NotificationService {
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
