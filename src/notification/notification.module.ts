import { Module } from '@nestjs/common';
import { NotificationServiceInterface } from './types/notification-service';
import { ConsoleNotificationService } from './providers/console-notification/console-notification.service';
import { SendGridNotificationService } from './providers/sendgrid-notification/send-grid-notification.service';

const notificationProvider = {
  provide: NotificationServiceInterface,
  useClass:
    process.env.JEST_WORKER_ID === undefined &&
    (process.env.ENVIRONMENT === 'production' ||
      process.env.ENVIRONMENT === 'staging')
      ? SendGridNotificationService
      : ConsoleNotificationService,
};

@Module({
  providers: [notificationProvider],
  exports: [notificationProvider],
})
export class NotificationModule {}
