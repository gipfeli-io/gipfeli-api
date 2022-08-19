import { TourService } from './tour.service';
import repositoryMockFactory from '../utils/mock-utils/repository-mock.factory';
import { Tour } from './entities/tour.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthenticatedUserDto } from '../user/dto/user.dto';
import { Image } from '../media/entities/image.entity';
import { CreateTourDto, TourDto, UpdateTourDto } from './dto/tour.dto';
import { TourController } from './tour.controller';
import { UserRole } from '../user/entities/user.entity';
import { GpxFile } from '../media/entities/gpx-file.entity';
import { TourCategoryDto } from './dto/tour-category.dto';

const mockUser: AuthenticatedUserDto = {
  email: 'test@gipfeli.io',
  id: 'mocked-id',
  role: UserRole.USER,
};

const mockCategories: TourCategoryDto[] = [
  {
    id: 'cat-1',
    name: 'Cat 1',
  },
  {
    id: 'cat-2',
    name: 'Cat 2',
  },
];

const mockId = 'mocked-tour-id';
const mockExistingTour: UpdateTourDto = {
  id: mockId,
  description: 'testExisting',
  categories: mockCategories,
} as UpdateTourDto;
const mockNewTour: CreateTourDto = {
  description: 'testNew',
  categories: mockCategories,
} as CreateTourDto;
const mockTour: TourDto = {
  description: 'testMock',
  categories: mockCategories,
} as TourDto;

describe('TourService', () => {
  let tourController: TourController;
  let tourService: TourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourController,
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

    tourController = module.get<TourController>(TourController);
    tourService = module.get<TourService>(TourService);
  });

  describe('findAll', () =>
    it('calls tourService.findAll() with the correct params and returns it', async () => {
      const spy = jest
        .spyOn(tourService, 'findAll')
        .mockReturnValue(Promise.resolve([mockTour]));

      const result = await tourController.findAll(mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual([mockTour]);
    }));

  describe('findOne', () =>
    it('calls tourService.findOne() with the correct params and returns it', async () => {
      const spy = jest
        .spyOn(tourService, 'findOne')
        .mockReturnValue(Promise.resolve(mockTour));

      const result = await tourController.findOne(mockId, mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockId, mockUser);
      expect(result).toEqual(mockTour);
    }));

  describe('create', () =>
    it('calls tourService.create() with the correct params and returns it', async () => {
      const spy = jest
        .spyOn(tourService, 'create')
        .mockReturnValue(Promise.resolve(mockNewTour as Tour));

      const result = await tourController.create(mockNewTour, mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockNewTour, mockUser);
      expect(result).toEqual(mockNewTour);
    }));

  describe('update', () =>
    it('calls tourService.update() with the correct params and returns it', async () => {
      const spy = jest
        .spyOn(tourService, 'update')
        .mockReturnValue(Promise.resolve(mockExistingTour as Tour));

      const result = await tourController.update(
        mockId,
        mockExistingTour,
        mockUser,
      );

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockId, mockExistingTour, mockUser);
      expect(result).toEqual(mockExistingTour);
    }));

  describe('delete', () =>
    it('calls tourService.remove() with the correct params and returns void', async () => {
      const spy = jest
        .spyOn(tourService, 'remove')
        .mockReturnValue(Promise.resolve(undefined));

      const result = await tourController.remove(mockId, mockUser);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(mockId, mockUser);
      expect(result).toEqual(undefined);
    }));
});
