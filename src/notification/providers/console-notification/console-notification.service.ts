import { Injectable } from '@nestjs/common';
import { NotificationRecipient, NotificationService, } from '../../types/notification-service';
import { UserDto } from '../../../user/dto/user';

@Injectable()
export class ConsoleNotificationService implements NotificationService {
  sendDebugMessage(message: string, recipient: NotificationRecipient): boolean {
    console.log('sendDebugMessage:');
    this.printRecipient(recipient);
    console.log(`=> Message: ${message}`);

    return true;
  }

  sendSignUpMessage(token: string, recipient: UserDto): boolean {
    const { id } = recipient;
    console.log('sendSignUpMessage:');
    this.printRecipient(this.extractRecipientFromUser(recipient));
    console.log(`=> userId: ${id}`);
    console.log(`=> token: ${token}`);

    return true;
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
