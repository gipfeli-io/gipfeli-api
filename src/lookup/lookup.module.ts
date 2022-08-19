import { Module } from '@nestjs/common';
import { LookupController } from './lookup.controller';
import { LookupService } from './lookup.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TourCategory } from '../tour/entities/tour-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TourCategory])],
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}
