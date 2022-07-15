import { Module, Provider } from '@nestjs/common';
import { NotificationServiceInterface } from './types/notification-service';
import { ConsoleNotificationService } from './providers/console-notification/console-notification.service';
import { SendGridNotificationService } from './providers/sendgrid-notification/send-grid-notification.service';
import { ConfigService } from '@nestjs/config';

const notificationProviderFactory: Provider = {
  provide: NotificationServiceInterface,
  useFactory: (configService: ConfigService) => {
    return configService.get<string>('JEST_WORKER_ID') === undefined &&
      (configService.get<string>('environment.environment') === 'production' ||
        configService.get<string>('environment.environment') === 'staging')
      ? new SendGridNotificationService(configService)
      : new SendGridNotificationService(configService);
  },
  inject: [ConfigService],
};

@Module({
  providers: [notificationProviderFactory, ConfigService],
  exports: [notificationProviderFactory],
})
export class NotificationModule {}
