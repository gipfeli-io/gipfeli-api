import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../infrastructure/entities/user.entity';
import { UserService } from './services/user.service';
import { AppService } from './services/app.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserService, AppService],
  exports: [UserService, AppService],
})
export class CoreModule {}
