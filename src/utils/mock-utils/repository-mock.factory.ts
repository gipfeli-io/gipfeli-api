import { Repository } from 'typeorm';

export type RepositoryMockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

/**
 * Factory class that returns a mocked repository for a given type.
 * See: see: https://stackoverflow.com/questions/55366037/inject-typeorm-repository-into-nestjs-service-for-mock-data-testing
 */
const repositoryMockFactory: () => RepositoryMockType<Repository<any>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    findOneOrFail: jest.fn((entity) => entity),
    findByIds: jest.fn((ids) => ids),
    find: jest.fn((entities) => entities),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    delete: jest.fn((entity) => entity),
    update: jest.fn((entity) => entity),
    merge: jest.fn((entity) => entity),
    createQueryBuilder: jest.fn(() => ({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn((entity) => [entity]),
      getOneOrFail: jest.fn((entity) => entity),
      addSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn((entity) => entity),
    })),
  }));

export default repositoryMockFactory;
