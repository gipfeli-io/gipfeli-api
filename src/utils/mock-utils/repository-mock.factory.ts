import { Repository } from 'typeorm';

export type RepositoryMockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

/**
 * Factory class that returns a mocked repository for a given type.
 * See: see: https://stackoverflow.com/questions/55366037/inject-typeorm-repository-into-nestjs-service-for-mock-data-testing
 * Todo: maybe use this isntead of the repository mock? :D
 */
const repositoryMockFactory: () => RepositoryMockType<Repository<any>> =
  jest.fn(() => ({
    findOne: jest.fn((entity) => entity),
    find: jest.fn((entities) => entities),
    create: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    delete: jest.fn((entity) => entity),
    createQueryBuilder: jest.fn(() => ({
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOneOrFail: jest.fn((entity) => entity),
    })),
  }));

export default repositoryMockFactory;
