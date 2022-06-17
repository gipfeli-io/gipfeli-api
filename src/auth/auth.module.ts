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
import { NotificationModule } from '../notification/notification.module';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
    UserModule,
    UtilsModule,
    PassportModule,
    NotificationModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    LocalAuthGuard,
    JwtAuthGuard,
    RefreshAuthGuard,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
