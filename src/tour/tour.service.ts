import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour';
import { AuthenticatedUserDto } from '../user/dto/user';
import { Image } from '../media/entities/image.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async create(
    createTourDto: CreateTourDto,
    user: AuthenticatedUserDto,
  ): Promise<Tour> {
    const { images, ...tour } = createTourDto;
    const savedImages = await this.imageRepository.findByIds(
      images.map((image) => image.id),
      { where: { user } },
    );

    const newTour = this.tourRepository.create({
      user,
      images: savedImages,
      ...tour,
    });

    return this.tourRepository.save(newTour);
  }

  findAll(user: AuthenticatedUserDto): Promise<TourDto[]> {
    return this.tourRepository.find({
      where: { user },
    });
  }

  async findOne(id: string, user: AuthenticatedUserDto): Promise<TourDto> {
    const result = await this.tourRepository.findOne(id, {
      where: { user },
      relations: ['images'],
    });

    if (!result) {
      throw new NotFoundException();
    }

    return result;
  }

  async update(
    id: string,
    updateTourDto: UpdateTourDto,
    user: AuthenticatedUserDto,
  ): Promise<Tour> {
    const { images, ...tour } = updateTourDto;

    const existingTour = await this.tourRepository.findOne(id, {
      where: { user },
    });

    if (!existingTour) {
      throw new NotFoundException();
    }

    // We have to manually add our images and then merge the result, because
    // repository.update() does not sync relations.
    const savedImages = await this.imageRepository.findByIds(
      images.map((image) => image.id),
      { where: { user } },
    );

    existingTour.images = savedImages;
    const mergedTour = this.tourRepository.merge(existingTour, tour);
    await this.tourRepository.save(mergedTour);

    return this.tourRepository.findOne(id, { relations: ['user', 'images'] });
  }

  async remove(id: string, user: AuthenticatedUserDto): Promise<void> {
    const deleteResult = await this.tourRepository.delete({ id, user });

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
