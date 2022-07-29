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
import { AuthenticatedUserDto } from '../user/dto/user';
import { Image } from '../media/entities/image.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateTourDto, UpdateTourDto } from './dto/tour';
import { SavedImageDto } from '../media/dto/image';
import { UserRole } from '../user/entities/user.entity';

const mockUser: AuthenticatedUserDto = {
  email: 'test@gipfeli.io',
  id: 'mocked-id',
  role: UserRole.USER,
};
const mockImages: SavedImageDto[] = [
  { id: 'img-1', identifier: 'ident-1', location: null },
  { id: 'img-2', identifier: 'ident-2', location: null },
];
const mockId = 'mocked-tour-id';
const mockExistingTour: UpdateTourDto = {
  id: mockId,
  description: 'test',
  images: mockImages,
} as UpdateTourDto;
const mockNewTour: CreateTourDto = {
  description: 'test',
  images: mockImages,
} as CreateTourDto;

describe('TourService', () => {
  let tourService: TourService;
  let tourRepositoryMock: RepositoryMockType<Repository<Tour>>;
  let imageRepositoryMock: RepositoryMockType<Repository<Image>>;

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
      ],
    }).compile();

    tourService = module.get<TourService>(TourService);
    tourRepositoryMock = module.get(getRepositoryToken(Tour));
    imageRepositoryMock = module.get(getRepositoryToken(Image));
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
    it('scopes the query to the current user and returns the result with the images in relation', async () => {
      tourRepositoryMock.findOne.mockReturnValue(mockExistingTour);

      const result = await tourService.findOne(mockId, mockUser);

      const expectedConditions: FindOneOptions<Tour> = {
        relations: ['images'],
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
        relations: ['images'],
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

    it('raises NotFoundException if trying to update tour that does not match selection', async () => {
      tourRepositoryMock.findOne.mockReturnValue(undefined);

      const result = async () =>
        await tourService.update(mockId, mockExistingTour, mockUser);

      await expect(result).rejects.toThrow(NotFoundException);
      expect(tourRepositoryMock.findOne).toHaveBeenCalledTimes(1);
      expect(tourRepositoryMock.save).not.toHaveBeenCalled();
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

  describe('create', () => {
    it('creates a tour with assigned images and returns it', async () => {
      tourRepositoryMock.create.mockReturnValue(mockNewTour);
      tourRepositoryMock.save.mockReturnValue(mockNewTour);
      imageRepositoryMock.findByIds.mockReturnValue(mockImages);
      const { images, ...tourData } = mockNewTour;

      const result = await tourService.create(mockNewTour, mockUser);

      const expectedConditions = {
        user: mockUser,
        images: mockImages,
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
  });
});
