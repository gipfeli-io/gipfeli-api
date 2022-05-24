import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AppService } from './services/app.service';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { TourService } from './services/tour.service';
import { Tour } from '../infrastructure/entities/tour.entity';

@Module({
  imports: [InfrastructureModule, TypeOrmModule.forFeature([User, Tour])],
  providers: [AppService, TourService],
  exports: [AppService, TourService],
})
export class CoreModule {}
