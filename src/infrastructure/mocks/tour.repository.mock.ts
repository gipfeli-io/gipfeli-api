import { UserDto } from '../../core/dtos/user';
import { CreateTourDto, TourDto } from '../../core/dtos/tour';
import { Tour } from '../entities/tour.entity';
import {
  DeleteResult,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  UpdateResult,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { tourDataMock } from './tour.data.mock';

const results = tourDataMock;
export const tourRepositoryMock = {
  create: jest.fn(function (newTour: UserDto | CreateTourDto) {
    return newTour;
  }),
  save: jest.fn(function (newTour: Tour) {
    return Promise.resolve(newTour);
  }),
  find: jest.fn(function (options: FindManyOptions<Tour>) {
    const user = (options.where as FindConditions<Tour>).user as User;
    return Promise.resolve(
      results.filter((result) => result.user.id === user.id),
    );
  }),
  findOne: jest.fn(function (id: string, options: FindOneOptions<Tour>) {
    const user = (options.where as FindConditions<Tour>)?.user as User;
    let filteredResults: TourDto;

    if (user) {
      filteredResults = results.find(
        (result) => result.id === id && result.user.id === user.id,
      );
    } else {
      filteredResults = results.find((result) => result.id === id);
    }
    return Promise.resolve(filteredResults);
  }),
  update: jest.fn(function (
    criteria: FindConditions<Tour>,
    updateEntity: QueryDeepPartialEntity<Tour>,
  ) {
    const user = (criteria as FindConditions<Tour>).user as User;
    const id = (criteria as FindConditions<Tour>).id;
    const tours = results.filter(
      (result) => result.id === id && result.user.id === user.id,
    );

    let result: UpdateResult;
    if (tours) {
      result = { affected: tours.length } as UpdateResult;
    } else {
      result = { affected: 0 } as UpdateResult;
    }

    return Promise.resolve(result);
  }),
  delete: jest.fn(function (criteria: FindConditions<Tour>) {
    const user = (criteria as FindConditions<Tour>).user as User;
    const id = (criteria as FindConditions<Tour>).id;
    const tours = results.filter(
      (result) => result.id === id && result.user.id === user.id,
    );

    let result: DeleteResult;
    if (tours) {
      result = { affected: tours.length } as UpdateResult;
    } else {
      result = { affected: 0 } as UpdateResult;
    }

    return Promise.resolve(result);
  }),
};
