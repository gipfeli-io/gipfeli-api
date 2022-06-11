import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UtilsModule } from '../utils/utils.module';
import { UserToken } from './entities/user-token.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken]), UtilsModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
