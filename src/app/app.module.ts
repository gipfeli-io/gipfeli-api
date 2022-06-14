import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TourModule } from '../tour/tour.module';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { SendGridNotificationService } from '../notification/providers/sendgrid-notification/send-grid-notification.service';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig), AuthModule, TourModule],
  controllers: [AppController],
  providers: [
    {
      provide: NotificationServiceInterface,
      useClass: SendGridNotificationService,
    },
  ],
})
export class AppModule {}
