import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour';
import { UserDto } from '../user/dto/user';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
  ) {}

  async create(createTourDto: CreateTourDto, user: UserDto): Promise<Tour> {
    const newTour = this.tourRepository.create({ user, ...createTourDto });

    return await this.tourRepository.save(newTour);
  }

  findAll(user: UserDto): Promise<TourDto[]> {
    return this.tourRepository.find({
      where: { user },
      relations: ['user'],
    });
  }

  async findOne(id: string, user: UserDto): Promise<TourDto> {
    const result = await this.tourRepository.findOne(id, {
      where: { user },
      relations: ['user'],
    });

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  async update(
    id: string,
    updateTourDto: UpdateTourDto,
    user: UserDto,
  ): Promise<Tour> {
    const updateResult = await this.tourRepository.update(
      { id, user },
      updateTourDto,
    );

    if (updateResult.affected === 0) {
      throw new NotFoundException();
    }

    return await this.tourRepository.findOne(id, { relations: ['user'] });
  }

  async remove(id: string, user: UserDto): Promise<void> {
    const deleteResult = await this.tourRepository.delete({ id, user });

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
