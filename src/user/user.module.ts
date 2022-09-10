import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UtilsModule } from '../utils/utils.module';
import { UserToken } from './entities/user-token.entity';
import { UserAuthService } from './user-auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserToken]), UtilsModule],
  providers: [UserService, UserAuthService],
  controllers: [UserController],
  exports: [UserService, UserAuthService],
})
export class UserModule {}
