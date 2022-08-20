import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour.dto';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { Image } from '../media/entities/image.entity';
import { GpxFile } from '../media/entities/gpx-file.entity';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(GpxFile)
    private readonly gpxFileRepository: Repository<GpxFile>,
  ) {}

  async create(
    createTourDto: CreateTourDto,
    user: AuthenticatedUserDto,
  ): Promise<Tour> {
    const { images, gpxFile, ...tour } = createTourDto;
    const savedImages = await this.imageRepository.findByIds(
      images.map((image) => image.id),
      { where: { user } },
    );

    let savedGpxFile;
    if (gpxFile) {
      savedGpxFile = await this.gpxFileRepository.findOne(gpxFile.id, {
        where: { user },
      });
    }

    const newTour = this.tourRepository.create({
      user,
      images: savedImages,
      gpxFile: savedGpxFile,
      ...tour,
    });

    return this.tourRepository.save(newTour);
  }

  findAll(user: AuthenticatedUserDto): Promise<TourDto[]> {
    return this.tourRepository.find({
      where: { user },
      relations: ['categories'],
    });
  }

  async findOne(id: string, user: AuthenticatedUserDto): Promise<TourDto> {
    const result = await this.tourRepository.findOne(id, {
      where: { user },
      relations: ['images', 'gpxFile', 'categories'],
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
    const { images, gpxFile, ...tour } = updateTourDto;

    const existingTour = await this.tourRepository.findOne(id, {
      where: { user },
    });

    if (!existingTour) {
      throw new NotFoundException();
    }

    // We have to manually add our images and then merge the result, because
    // repository.update() does not sync relations.
    existingTour.images = await this.imageRepository.findByIds(
      images.map((image) => image.id),
      { where: { user } },
    );

    existingTour.gpxFile = gpxFile
      ? await this.gpxFileRepository.findOne(gpxFile.id, {
          where: { user },
        })
      : null;

    const mergedTour = this.tourRepository.merge(existingTour, tour);
    await this.tourRepository.save(mergedTour);

    return this.tourRepository.findOne(id, {
      relations: ['images', 'gpxFile', 'categories'],
    });
  }

  async remove(id: string, user: AuthenticatedUserDto): Promise<void> {
    const deleteResult = await this.tourRepository.delete({ id, user });

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }
}
