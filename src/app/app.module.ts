import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { CoreModule } from '../core/core.module';
import { UserController } from '../user/user.controller';
import { TourController } from './controllers/tour.controller';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [CoreModule, TypeOrmModule.forRoot(DatabaseConfig)],
  controllers: [AppController, UserController, TourController],
})
export class AppModule {}
