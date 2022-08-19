import { Test, TestingModule } from '@nestjs/testing';
import { LookupController } from './lookup.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import repositoryMockFactory from '../utils/mock-utils/repository-mock.factory';
import { LookupService } from './lookup.service';
import { TourCategory } from '../tour/entities/tour-category.entity';

describe('LookupController', () => {
  let lookupController: LookupController;
  let lookupService: LookupService;
  let mockTourCategories: TourCategory[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LookupController,
        LookupService,
        {
          provide: getRepositoryToken(TourCategory),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    mockTourCategories = [
      {
        id: 'cat-1',
        name: 'Cat 1',
      },
      {
        id: 'cat-2',
        name: 'Cat 2',
      },
      {
        id: 'cat-3',
        name: 'Cat 3',
      },
    ] as TourCategory[];

    lookupController = module.get<LookupController>(LookupController);
    lookupService = module.get<LookupService>(LookupService);
  });

  describe('Tour Categories', () => {
    it('Find all', async () => {
      const spy = jest
        .spyOn(lookupService, 'findAllTourCategories')
        .mockReturnValue(Promise.resolve(mockTourCategories));

      const result = await lookupController.findAllTourCategories();

      expect(spy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTourCategories);
    });
  });
});
