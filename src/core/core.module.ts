import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../infrastructure/entities/user.entity';
import { UserService } from './services/user.service';
import { AppService } from './services/app.service';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './common/constants';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TourService } from './services/tour.service';
import { Tour } from '../infrastructure/entities/tour.entity';

@Module({
  imports: [
    InfrastructureModule,
    TypeOrmModule.forFeature([User, Tour]),
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '3600s' },
    }),
  ],
  providers: [UserService, AppService, AuthService, TourService],
  exports: [UserService, AppService, AuthService, TourService],
})
export class CoreModule {}
