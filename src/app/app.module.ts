import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TourModule } from '../tour/tour.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import securityConfig from '../config/security.config';
import databaseConfig from '../config/database.config';
import environmentConfig from '../config/environment.config';
import integrationsConfig from '../config/integrations.config';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    AuthModule,
    TourModule,
    NotificationModule,
    ConfigModule.forRoot({
      load: [securityConfig, environmentConfig, integrationsConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forRoot({ load: [databaseConfig] })],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
