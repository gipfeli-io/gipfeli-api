import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { CoreModule } from '../core/core.module';
import { UserController } from './controllers/user.controller';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/strategies/local.strategy';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [CoreModule, InfrastructureModule, PassportModule],
  providers: [LocalStrategy, JwtStrategy],
  controllers: [AppController, UserController],
})
export class AppModule {}
