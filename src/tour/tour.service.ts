import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Tour } from './entities/tour.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour.dto';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { Image } from '../media/entities/image.entity';
import { GpxFile } from '../media/entities/gpx-file.entity';
import { TourCategory } from './entities/tour-category.entity';
import { SavedImageDto } from '../media/dto/image.dto';
import { SavedGpxFileDto } from '../media/dto/gpx-file.dto';
import { TourCategoryDto } from './dto/tour-category.dto';

@Injectable()
export class TourService {
  constructor(
    @InjectRepository(Tour)
    private readonly tourRepository: Repository<Tour>,
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    @InjectRepository(GpxFile)
    private readonly gpxFileRepository: Repository<GpxFile>,
    @InjectRepository(TourCategory)
    private readonly tourCategoryRepository: Repository<TourCategory>,
  ) {}

  async create(
    createTourDto: CreateTourDto,
    user: AuthenticatedUserDto,
  ): Promise<Tour> {
    const { images, gpxFile, categories, ...tour } = createTourDto;
    const savedImages = await this.getImagesFromDatabase(images, user);
    const savedGpxFile = await this.getGpxFileFromDatabase(gpxFile, user);
    const categoryList = await this.getCategoryListFromDatabase(categories);

    const newTour = this.tourRepository.create({
      user,
      images: savedImages,
      gpxFile: savedGpxFile,
      categories: categoryList,
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
    const { images, gpxFile, categories, ...tour } = updateTourDto;

    const existingTour = await this.tourRepository.findOne(id, {
      where: { user },
    });

    if (!existingTour) {
      throw new NotFoundException();
    }

    // We have to manually add our images and then merge the result, because
    // repository.update() does not sync relations.
    existingTour.images = await this.getImagesFromDatabase(
      images,
      user,
      existingTour,
    );
    existingTour.gpxFile = await this.getGpxFileFromDatabase(
      gpxFile,
      user,
      existingTour,
    );
    existingTour.categories = await this.getCategoryListFromDatabase(
      categories,
    );

    const mergedTour = this.tourRepository.merge(existingTour, tour);
    await this.tourRepository.save(mergedTour);

    const a = this.tourRepository.findOne(id, {
      relations: ['images', 'gpxFile', 'categories'],
    });

    return a;
  }

  async remove(id: string, user: AuthenticatedUserDto): Promise<void> {
    const deleteResult = await this.tourRepository.delete({ id, user });

    if (deleteResult.affected === 0) {
      throw new NotFoundException();
    }
  }

  private async getImagesFromDatabase(
    imagesToSave: SavedImageDto[],
    user: AuthenticatedUserDto,
    existingTour: Tour = null,
  ): Promise<Image[]> {
    // We only want images by the user and, if a tour is supplied e.g. in the
    // case of an update, where tour id is either the current tour or null. This
    // prevents the possibility of overriding tour relations of existing images.
    let whereCondition: FindOneOptions<Image>;
    if (existingTour) {
      whereCondition = {
        where: [
          {
            userId: user.id,
            tourId: null,
          },
          {
            userId: user.id,
            tourId: existingTour.id,
          },
        ],
      };
    } else {
      whereCondition = {
        where: {
          userId: user.id,
          tourId: null,
        },
      };
    }

    return this.imageRepository.findByIds(
      imagesToSave.map((image) => image.id),
      whereCondition,
    );
  }

  private async getGpxFileFromDatabase(
    gpxFileToSave: SavedGpxFileDto,
    user: AuthenticatedUserDto,
    existingTour: Tour = null,
  ): Promise<GpxFile> {
    if (!gpxFileToSave) {
      return null;
    }

    const gpxFile = await this.gpxFileRepository.findOne(gpxFileToSave.id, {
      where: { user },
      relations: ['tour'],
    });

    if (!gpxFile) {
      return null;
    }

    // If no existing tour, we only return the file if it is not already
    // assigned to another tour.
    if (!existingTour) {
      return gpxFile.tour === null ? gpxFile : null;
    }

    // If an existing tour, we only return the file if it is either not yet
    // assigned to a tour or if it is already assigned to the existing tour.
    return gpxFile.tour === null ||
      (gpxFile.tour && gpxFile.tour.id === existingTour.id)
      ? gpxFile
      : null;
  }

  private async getCategoryListFromDatabase(
    categories: TourCategoryDto[],
  ): Promise<TourCategory[]> {
    return this.tourCategoryRepository.findByIds(
      categories.map((category) => category.id),
    );
  }
}
