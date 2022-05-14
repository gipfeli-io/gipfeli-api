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
    let tour = this.tourRepository.create(createTourDto);
    tour = await this.tourRepository.save(tour);

    return tour;
  }

  findAll(): Promise<TourDto[]> {
    // todo: async not required?
    return this.tourRepository.find();
  }

  findOne(id: string): Promise<TourDto> {
    return this.tourRepository.findOne({ where: [{ id: id }] });
  }

  update(id: number, updateTourDto: UpdateTourDto) {
    return `This action updates a #${id} tour`;
  }

  remove(id: string): Promise<DeleteResult> {
    return this.tourRepository.delete({ id: id });
  }
}
