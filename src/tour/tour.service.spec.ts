import { TourService } from './tour.service';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import {
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { Tour } from './entities/tour.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { Image } from '../media/entities/image.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTourDto, UpdateTourDto } from './dto/tour.dto';
import { SavedImageDto } from '../media/dto/image.dto';
import { UserRole } from '../user/entities/user.entity';
import { SavedGpxFileDto } from '../media/dto/gpx-file.dto';
import { GpxFile } from '../media/entities/gpx-file.entity';

const mockUser: AuthenticatedUserDto = {
  email: 'test@gipfeli.io',
  id: 'mocked-id',
  role: UserRole.USER,
};
const mockImages: SavedImageDto[] = [
  { id: 'img-1', identifier: 'ident-1', location: null },
  { id: 'img-2', identifier: 'ident-2', location: null },
];

const mockGpxFile: SavedGpxFileDto = {
  id: 'gpx-file',
  identifier: 'gxp-identifier',
  name: 'gpx-name',
};

const mockId = 'mocked-tour-id';

describe('TourService', () => {
  let tourService: TourService;
  let tourRepositoryMock: RepositoryMockType<Repository<Tour>>;
  let imageRepositoryMock: RepositoryMockType<Repository<Image>>;
  let gpxRepositoryMock: RepositoryMockType<Repository<GpxFile>>;
  let mockExistingTour: UpdateTourDto;
  let mockNewTour: CreateTourDto;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        {
          provide: getRepositoryToken(Tour),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Image),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(GpxFile),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    mockExistingTour = {
      id: mockId,
      description: 'test',
      images: mockImages,
      gpxFile: mockGpxFile,
    } as UpdateTourDto;

    mockNewTour = {
      description: 'test',
      images: mockImages,
      gpxFile: mockGpxFile,
    } as CreateTourDto;

    tourService = module.get<TourService>(TourService);
    tourRepositoryMock = module.get(getRepositoryToken(Tour));
    imageRepositoryMock = module.get(getRepositoryToken(Image));
    gpxRepositoryMock = module.get(getRepositoryToken(GpxFile));
  });

  describe('findAll', () =>
    it('scopes the query to the current user and returns the result', async () => {
      const mockResult: Tour[] = [{ id: 'mock' } as Tour];
      tourRepositoryMock.find.mockReturnValue(mockResult);

      const result = await tourService.findAll(mockUser);

      const expectedConditions: FindManyOptions<Tour> = {
        where: { user: mockUser },
      };
      expect(tourRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.find).toHaveBeenCalledWith(expectedConditions);
      expect(result).toEqual(mockResult);
    }));

  describe('findOne', () => {
    it('scopes the query to the current user and returns the result with the images and the gpx file in relation', async () => {
      tourRepositoryMock.findOne.mockReturnValue(mockExistingTour);

      const result = await tourService.findOne(mockId, mockUser);

      const expectedConditions: FindOneOptions<Tour> = {
        relations: ['images', 'gpxFile'],
        where: { user: mockUser },
      };
      expect(tourRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.findOne).toHaveBeenCalledWith(
        mockId,
        expectedConditions,
      );
      expect(result).toEqual(mockExistingTour);
    });

    it('raises NotFoundException if the query does not return a result', async () => {
      tourRepositoryMock.findOne.mockReturnValue(undefined);

      const result = async () => await tourService.findOne(mockId, mockUser);
      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('calls the image repository with correct IDs and user scope', async () => {
      tourRepositoryMock.findOne.mockReturnValue(mockExistingTour);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);

      await tourService.update(mockId, mockExistingTour, mockUser);

      const expectedIds = mockImages.map((image) => image.id);
      const expectedConditions: FindManyOptions<Image> = {
        where: { user: mockUser },
      };

      expect(imageRepositoryMock.findByIds).toHaveBeenCalledTimes(1);
      expect(imageRepositoryMock.findByIds).toHaveBeenCalledWith(
        expectedIds,
        expectedConditions,
      );
    });

    it('calls the gpx file repository with the correct ID and user scope', async () => {
      tourRepositoryMock.findOne.mockReturnValue(mockExistingTour);
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);

      await tourService.update(mockId, mockExistingTour, mockUser);

      const expectedConditions: FindManyOptions<GpxFile> = {
        where: { user: mockUser },
      };

      expect(gpxRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(gpxRepositoryMock.findOne).toHaveBeenCalledWith(
        mockGpxFile.id,
        expectedConditions,
      );
    });

    it('updates an existing tour by scoping it and then finds and returns it', async () => {
      tourRepositoryMock.findOne.mockReturnValue(mockExistingTour);
      tourRepositoryMock.save.mockReturnValue(mockExistingTour);

      const result = await tourService.update(
        mockId,
        mockExistingTour,
        mockUser,
      );
      expect(tourRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.save).toHaveBeenCalledWith(mockExistingTour);
      expect(tourRepositoryMock.findOne).toHaveBeenCalledTimes(2);
      expect(tourRepositoryMock.findOne).toHaveBeenCalledWith(mockId, {
        relations: ['images', 'gpxFile'],
      });
      expect(tourRepositoryMock.findOne).toHaveBeenCalledWith(mockId, {
        where: { user: mockUser },
      });
      expect(result).toEqual(mockExistingTour);
    });

    it('sets the image property on the tour and merges the entity with the DTO', async () => {
      const mockTourWithoutImage = Object.assign({}, mockExistingTour);
      mockTourWithoutImage.images = [];
      tourRepositoryMock.findOne.mockReturnValue(
        Object.assign({}, mockTourWithoutImage),
      );
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);

      const result = await tourService.update(
        mockId,
        mockTourWithoutImage,
        mockUser,
      );

      // Merge is called with the entity (added with images) and the DTO (without images)
      const expectedEntity = {
        ...mockTourWithoutImage,
        images: mockImages,
      };
      const expectedDto = {
        description: mockTourWithoutImage.description,
        id: mockTourWithoutImage.id,
      };
      expect(tourRepositoryMock.merge).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.merge).toHaveBeenCalledWith(
        expectedEntity,
        expectedDto,
      );
      expect(result.images).toEqual(mockImages);
    });

    it('sets the gpx file property on the tour and merges the entity with the DTO', async () => {
      const mockTourWithoutGxpFile = Object.assign({}, mockExistingTour);
      mockTourWithoutGxpFile.gpxFile = null;
      tourRepositoryMock.findOne.mockReturnValue(
        Object.assign({}, mockTourWithoutGxpFile),
      );
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);

      const result = await tourService.update(
        mockId,
        mockExistingTour,
        mockUser,
      );

      const expectedEntity = {
        ...mockTourWithoutGxpFile,
        gpxFile: mockGpxFile,
      };
      const expectedDto = {
        description: mockTourWithoutGxpFile.description,
        id: mockTourWithoutGxpFile.id,
      };

      expect(tourRepositoryMock.merge).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.merge).toHaveBeenCalledWith(
        expectedEntity,
        expectedDto,
      );
      expect(result.gpxFile).toEqual(mockGpxFile);
    });

    it('sets the gpx file property to null on the tour if property is sent as null and merges the entity with the DTO', async () => {
      const mockTourWithoutGpxFile = Object.assign({}, mockExistingTour);
      mockTourWithoutGpxFile.gpxFile = null;
      tourRepositoryMock.findOne.mockReturnValue(
        Object.assign({}, mockTourWithoutGpxFile),
      );
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);

      const result = await tourService.update(
        mockId,
        mockTourWithoutGpxFile,
        mockUser,
      );

      const expectedEntity = {
        ...mockTourWithoutGpxFile,
        gpxFile: null,
      };
      const expectedDto = {
        description: mockTourWithoutGpxFile.description,
        id: mockTourWithoutGpxFile.id,
      };
      expect(tourRepositoryMock.merge).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.merge).toHaveBeenCalledWith(
        expectedEntity,
        expectedDto,
      );
      expect(result.gpxFile).toEqual(null);
    });

    it('raises NotFoundException if trying to update tour that does not match selection', async () => {
      tourRepositoryMock.findOne.mockReturnValue(undefined);

      const result = async () =>
        await tourService.update(mockId, mockExistingTour, mockUser);

      await expect(result).rejects.toThrow(NotFoundException);
      expect(tourRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('creates a tour with assigned images and returns it', async () => {
      tourRepositoryMock.create.mockReturnValue(mockNewTour);
      tourRepositoryMock.save.mockReturnValue(mockNewTour);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);

      const { images, gpxFile, ...tourData } = mockNewTour;

      const result = await tourService.create(mockNewTour, mockUser);

      const expectedConditions = {
        user: mockUser,
        images: mockImages,
        gpxFile: mockGpxFile,
        ...tourData,
      };
      expect(tourRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.create).toHaveBeenCalledWith(
        expectedConditions,
      );
      expect(tourRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.save).toHaveBeenCalledWith(mockNewTour);
      expect(result).toEqual(mockNewTour);
    });

    it('creates a tour with assigned gpx file and returns it', async () => {
      tourRepositoryMock.create.mockReturnValue(mockNewTour);
      tourRepositoryMock.save.mockReturnValue(mockNewTour);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);
      const { images, gpxFile, ...tourData } = mockNewTour;

      const result = await tourService.create(mockNewTour, mockUser);

      const expectedConditions = {
        user: mockUser,
        images: mockImages,
        gpxFile: mockGpxFile,
        ...tourData,
      };
      expect(tourRepositoryMock.create).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.create).toHaveBeenCalledWith(
        expectedConditions,
      );
      expect(tourRepositoryMock.save).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.save).toHaveBeenCalledWith(mockNewTour);
      expect(result).toEqual(mockNewTour);
    });

    it('calls the image repository with correct IDs and user scope', async () => {
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);

      await tourService.create(mockNewTour, mockUser);

      const expectedIds = mockImages.map((image) => image.id);
      const expectedConditions: FindManyOptions<Image> = {
        where: { user: mockUser },
      };

      expect(imageRepositoryMock.findByIds).toHaveBeenCalledTimes(1);
      expect(imageRepositoryMock.findByIds).toHaveBeenCalledWith(
        expectedIds,
        expectedConditions,
      );
    });

    it('calls the gpx file repository with the correct id and user scope', async () => {
      gpxRepositoryMock.findOne.mockReturnValue(mockGpxFile);

      await tourService.create(mockNewTour, mockUser);

      const expectedConditions: FindManyOptions<GpxFile> = {
        where: { user: mockUser },
      };

      expect(gpxRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(gpxRepositoryMock.findOne).toHaveBeenCalledWith(
        mockGpxFile.id,
        expectedConditions,
      );
    });
  });
  describe('delete', () => {
    it('deletes an existing tour scoped to the user', async () => {
      tourRepositoryMock.delete.mockReturnValue({ affected: 1 });

      const result = await tourService.remove(mockId, mockUser);

      const expectedConditions: FindConditions<Tour> = {
        id: mockId,
        user: mockUser,
      };
      expect(tourRepositoryMock.delete).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.delete).toHaveBeenCalledWith(
        expectedConditions,
      );
      // Service returns undefined currently
      expect(result).toEqual(undefined);
    });

    it('raises NotFoundException if trying to delete tour that does not match selection', async () => {
      tourRepositoryMock.delete.mockReturnValue({ affected: 0 });

      const result = async () => await tourService.remove(mockId, mockUser);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
