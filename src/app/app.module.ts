import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { CoreModule } from '../core/core.module';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';

@Module({
  imports: [CoreModule, TypeOrmModule.forRoot(DatabaseConfig)],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
