import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import DatabaseConfig from './config/database-config';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig), UserModule],
  controllers: [AppController],
  imports: [AuthModule],
  controllers: [AppController, UsersController],
  providers: [AppService],
})
export class AppModule {}
