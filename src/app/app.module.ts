import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseConfig } from '../config/database-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig), AuthModule],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
