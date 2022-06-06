import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../user/dto/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TourService } from './tour.service';
import { Tour } from './entities/tour.entity';
import { TourDto } from './dto/tour';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { tourRepositoryMock } from './mocks/tour.repository.mock';
import {
  tourDataMockForFranz,
  tourDataMockForPaul,
} from './mocks/tour.data.mock';

const resultsForFranz = tourDataMockForFranz;
const resultsForPaul = tourDataMockForPaul;

describe('TourService', () => {
  let service: TourService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TourService,
        {
          provide: getRepositoryToken(Tour),
          useValue: tourRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<TourService>(TourService);
  });

  describe('findAll', () =>
    it('returns all tours for the given user', async () => {
      const result = await service.findAll({
        id: resultsForPaul[0].user.id,
      } as UserDto);

      expect(result.length).toEqual(2);
      expect(result[0].id).toEqual(resultsForPaul[0].id);
      expect(result[1].id).toEqual(resultsForPaul[1].id);
    }));

  describe('findOne', () => {
    it('returns an existing tour  for the given user', async () => {
      const result = await service.findOne(resultsForPaul[0].id, {
        id: resultsForPaul[0].user.id,
      } as UserDto);

      expect(result).toBeDefined();
      expect(result.id).toEqual(resultsForPaul[0].id);
    });

    it('does not return a tour that belongs to another user and throws NotFoundException', async () => {
      const call = async () =>
        await service.findOne(resultsForFranz[0].id, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(call).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates an existing tour and returns it', async () => {
      const result = await service.update(
        resultsForPaul[0].id,
        { name: 'updated' },
        {
          id: resultsForPaul[0].user.id,
        } as UserDto,
      );

      expect(result).toBeDefined();
      expect(result.id).toEqual(resultsForPaul[0].id);
    });

    it('raises NotFoundException if trying to update non existing tour', async () => {
      const result = async () =>
        await service.update('does-not-exist', { name: 'updated' }, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('raises NotFoundException if trying to update a tour of another user', async () => {
      const result = async () =>
        await service.update(resultsForFranz[0].id, { name: 'updated' }, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    // Todo: functions returns Promise<void>, not testable. refactor!
    xit('deletes an existing tour', async () => {
      const result = async () =>
        await service.remove(resultsForPaul[0].id, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(result).resolves.not.toThrow();
    });

    it('raises NotFoundException if trying to update non existing tour', async () => {
      const result = async () =>
        await service.remove(resultsForFranz[0].id, {
          id: 'does-not-exist',
        } as UserDto);

      await expect(result).rejects.toThrow(NotFoundException);
    });

    it('raises NotFoundException if trying to update a tour of another user', async () => {
      const result = async () =>
        await service.remove(resultsForFranz[0].id, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(result).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('creates a tour and returns it', async () => {
      const result = await service.create(
        { description: 'test' } as TourDto,
        {
          id: resultsForPaul[0].user.id,
        } as UserDto,
      );

      expect(result).toBeDefined();
      expect(result.description).toEqual('test');
    });
  });
});
