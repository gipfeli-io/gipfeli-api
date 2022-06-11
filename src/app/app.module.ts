import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TourModule } from '../tour/tour.module';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig), AuthModule, TourModule],
  controllers: [AppController],
})
export class AppModule {}
