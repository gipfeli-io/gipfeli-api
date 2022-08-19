import { Injectable } from '@nestjs/common';
import { TourCategoryDto } from '../tour/dto/tour-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TourCategory } from '../tour/entities/tour-category.entity';

@Injectable()
export class LookupService {
  constructor(
    @InjectRepository(TourCategory)
    private readonly tourCategoryRepository: Repository<TourCategory>,
  ) {}

  async findAllTourCategories(): Promise<TourCategoryDto[]> {
    return this.tourCategoryRepository.find();
  }
}
