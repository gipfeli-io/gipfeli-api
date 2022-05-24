import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tour])],
  providers: [TourService],
  controllers: [TourController],
})
export class TourModule {}

