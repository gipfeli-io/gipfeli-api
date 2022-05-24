import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { CoreModule } from '../core/core.module';
import { UserController } from './controllers/user.controller';
import { TourController } from './controllers/tour.controller';

@Module({
  imports: [CoreModule],
  controllers: [AppController, UserController, TourController],
})
export class AppModule {}
