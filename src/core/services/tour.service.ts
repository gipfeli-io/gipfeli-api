import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { Tour } from '../../infrastructure/entities/tour.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from '../dtos/tour';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
  ) {}

  async create(createTourDto: CreateTourDto): Promise<Tour> {
    const newTour = this.tourRepository.create(createTourDto);

    return await this.tourRepository.save(newTour);
  }

  findAll(): Promise<TourDto[]> {
    // todo: async not required?
    return this.tourRepository.find({ relations: ['user'] });
  }

  findOne(id: string): Promise<TourDto> {
    return this.tourRepository.findOne(id, { relations: ['user'] });
  }

  async update(id: string, updateTourDto: UpdateTourDto): Promise<Tour> {
    // Todo: this is not atomic, but there are no better ways I know of
    await this.tourRepository.update(id, updateTourDto);

    return await this.tourRepository.findOne(id, { relations: ['user'] });
  }

  remove(id: string): Promise<DeleteResult> {
    return this.tourRepository.delete(id);
  }
}
