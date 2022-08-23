import { faker } from '@faker-js/faker';
import { User, UserRole } from '../../src/user/entities/user.entity';
import { Tour } from '../../src/tour/entities/tour.entity';

export type Seeds = {
  users: User[];
  tours: Tour[];
};

export const SEEDS: Seeds = {
  users: [
    {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      password: faker.internet.password(8),
      role: UserRole.USER,
      tours: [],
      images: [],
      sessions: [],
      tokens: [],
      gpxFiles: [],
    },
    {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      isActive: true,
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      password: faker.internet.password(8),
      role: UserRole.ADMINISTRATOR,
      tours: [],
      images: [],
      sessions: [],
      tokens: [],
      gpxFiles: [],
    },
  ],
  tours: [
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.sentence(2),
      images: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      user: null,
      categories: [],
      description: faker.lorem.sentences(10),
      endLocation: null,
      startLocation: null,
      gpxFile: null,
      userId: null,
    },
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.sentence(2),
      images: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      user: null,
      categories: [],
      description: faker.lorem.sentences(10),
      endLocation: null,
      startLocation: null,
      gpxFile: null,
      userId: null,
    },
  ],
};
