import { Module } from '@nestjs/common';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UtilsModule } from '../utils/utils.module';
import { AuthController } from './auth.controller';
import { NotificationServiceInterface } from '../notification/types/notification-service';
import { ConsoleNotificationService } from '../notification/providers/console-notification/console-notification.service';
import {
  SendGridNotificationService
} from '../notification/providers/sendgrid-notification/send-grid-notification.service';

@Module({
  imports: [
    UserModule,
    UtilsModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    {
      provide: NotificationServiceInterface,
      useClass: SendGridNotificationService, // todo: toggle
    },
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
