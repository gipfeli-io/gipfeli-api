import { Test, TestingModule } from '@nestjs/testing';
import { LookupService } from './lookup.service';
import repositoryMockFactory, {
  RepositoryMockType,
} from '../utils/mock-utils/repository-mock.factory';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TourCategory } from '../tour/entities/tour-category.entity';

describe('LookupService', () => {
  let lookupService: LookupService;
  let lookupRepositoryMock: RepositoryMockType<Repository<TourCategory>>;
  let mockTourCategories: TourCategory[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    lookupRepositoryMock = module.get(getRepositoryToken(TourCategory));
    lookupService = module.get<LookupService>(LookupService);
  });

  describe('Tour Categories', () => {
    it('scopes the query to the current user and returns the result', async () => {
      lookupRepositoryMock.find.mockReturnValue(mockTourCategories);

      const result = await lookupService.findAllTourCategories();

      expect(lookupRepositoryMock.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockTourCategories);
    });
  });
});
