import { Module } from '@nestjs/common';
import { TourController } from './tour.controller';
import { TourService } from './tour.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tour } from './entities/tour.entity';
import { Image } from '../media/entities/image.entity';
import { GpxFile } from '../media/entities/gpx-file.entity';
import { TourCategory } from './entities/tour-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tour, Image, GpxFile, TourCategory])],
  providers: [TourService],
  controllers: [TourController],
})
export class TourModule {}
