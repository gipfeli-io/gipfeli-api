import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import DatabaseConfig from '../infrastructure/config/database-config';
import { CoreModule } from '../core/core.module';
import { UserController } from './controllers/user.controller';
import { AuthModule } from '../auth/auth.module';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(DatabaseConfig),
    CoreModule,
    AuthModule,
    InfrastructureModule,
  ],
  controllers: [AppController, UserController],
})
export class AppModule {}
