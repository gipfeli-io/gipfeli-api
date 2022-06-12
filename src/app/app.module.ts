import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TourModule } from '../tour/tour.module';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { ConsoleNotificationService } from '../notification/providers/console-notification/console-notification.service';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig), AuthModule, TourModule],
  controllers: [AppController],
  providers: [
    {
      provide: NotificationServiceInterface,
      useClass: ConsoleNotificationService, // todo: toggle
    },
  ],
})
export class AppModule {}
