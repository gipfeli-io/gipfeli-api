import { Test, TestingModule } from '@nestjs/testing';
import { UserDto } from '../../core/dtos/user';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TourController } from './tour.controller';
import { TourService } from '../../core/services/tour.service';
import { Tour } from '../../infrastructure/entities/tour.entity';
import {
  tourDataMockForFranz,
  tourDataMockForPaul,
} from '../../infrastructure/mocks/tour.data.mock';
import { tourRepositoryMock } from '../../infrastructure/mocks/tour.repository.mock';
import { BadRequestException } from '@nestjs/common';
import { TourDto } from '../../core/dtos/tour';

const resultsForFranz = tourDataMockForFranz;
const resultsForPaul = tourDataMockForPaul;

const results = [...resultsForFranz, ...resultsForPaul];

describe('TourController', () => {
  let tourController: TourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TourController],
      providers: [
        TourService,
        {
          provide: getRepositoryToken(Tour),
          useValue: tourRepositoryMock,
        },
      ],
    })
      .useMocker((token) => {
        if (token === TourService) {
          return {
            findAll: jest.fn().mockResolvedValue(results),
          };
        }
      })
      .compile();

    tourController = module.get<TourController>(TourController);
  });

  describe('findAll', () =>
    it('returns all tours for the given user', async () => {
      const controllerSpy = jest.spyOn(tourController, 'findAll');
      const result = await tourController.findAll({
        id: resultsForPaul[0].user.id,
      } as UserDto);

      expect(result.length).toEqual(2);
      expect(result[0].id).toEqual(resultsForPaul[0].id);
      expect(result[1].id).toEqual(resultsForPaul[1].id);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    }));

  describe('findOne', () => {
    it('returns an existing tour  for the given user', async () => {
      const controllerSpy = jest.spyOn(tourController, 'findOne');
      const result = await tourController.findOne(resultsForPaul[0].id, {
        id: resultsForPaul[0].user.id,
      } as UserDto);

      expect(result).toBeDefined();
      expect(result.id).toEqual(resultsForPaul[0].id);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('does not return a tour that belongs to another user', async () => {
      const controllerSpy = jest.spyOn(tourController, 'findOne');
      const result = await tourController.findOne(resultsForFranz[0].id, {
        id: resultsForPaul[0].user.id,
      } as UserDto);

      expect(result).not.toBeDefined();
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('update', () => {
    it('updates an existing tour and returns it', async () => {
      const controllerSpy = jest.spyOn(tourController, 'update');
      const result = await tourController.update(
        resultsForPaul[0].id,
        { name: 'updated' },
        {
          id: resultsForPaul[0].user.id,
        } as UserDto,
      );

      expect(result).toBeDefined();
      expect(result.id).toEqual(resultsForPaul[0].id);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('raises an exception if trying to update non existing tour', async () => {
      const controllerSpy = jest.spyOn(tourController, 'update');
      const result = async () =>
        await tourController.update('does-not-exist', { name: 'updated' }, {
          id: resultsForPaul[0].user.id,
        } as UserDto);

      await expect(result).rejects.toThrow(BadRequestException);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    it('raises an exception if trying to update a tour of another user', async () => {
      const controllerSpy = jest.spyOn(tourController, 'update');
      const result = async () =>
        await tourController.update(
          resultsForFranz[0].id,
          { name: 'updated' },
          {
            id: resultsForPaul[0].user.id,
          } as UserDto,
        );

      await expect(result).rejects.toThrow(BadRequestException);
      expect(controllerSpy).toHaveBeenCalledTimes(1);
    });

    describe('delete', () => {
      // Todo: functions returns Promise<void>, not testable. refactor!
      xit('deletes an existing tour', async () => {
        const controllerSpy = jest.spyOn(tourController, 'remove');
        const result = async () =>
          await tourController.remove(resultsForPaul[0].id, {
            id: resultsForPaul[0].user.id,
          } as UserDto);

        await expect(result).resolves.not.toThrow();
        expect(controllerSpy).toHaveBeenCalledTimes(1);
      });

      it('raises an exception if trying to update non existing tour', async () => {
        const controllerSpy = jest.spyOn(tourController, 'remove');
        const result = async () =>
          await tourController.remove(resultsForFranz[0].id, {
            id: 'does-not-exist',
          } as UserDto);

        await expect(result).rejects.toThrow(BadRequestException);
        expect(controllerSpy).toHaveBeenCalledTimes(1);
      });

      it('raises an exception if trying to update a tour of another user', async () => {
        const controllerSpy = jest.spyOn(tourController, 'remove');
        const result = async () =>
          await tourController.remove(resultsForFranz[0].id, {
            id: resultsForPaul[0].user.id,
          } as UserDto);

        await expect(result).rejects.toThrow(BadRequestException);
        expect(controllerSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('create', () => {
      it('creates a tour and returns it', async () => {
        const controllerSpy = jest.spyOn(tourController, 'create');
        const result = await tourController.create(
          { description: 'test' } as TourDto,
          {
            id: resultsForPaul[0].user.id,
          } as UserDto,
        );

        expect(result).toBeDefined();
        expect(result.description).toEqual('test');
        expect(controllerSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
