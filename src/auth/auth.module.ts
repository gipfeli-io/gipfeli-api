import { forwardRef, Module } from '@nestjs/common';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UtilsModule } from '../utils/utils.module';
import { AuthController } from './auth.controller';
import { NotificationModule } from '../notification/notification.module';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenBearerStrategy } from './strategies/token-bearer.strategy';
import { TokenBearerAuthGuard } from './guards/token-bearer-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
    forwardRef(() => UserModule),
    UtilsModule,
    PassportModule,
    NotificationModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('security.jwtSecret'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    TokenBearerStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    RefreshAuthGuard,
    TokenBearerAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
