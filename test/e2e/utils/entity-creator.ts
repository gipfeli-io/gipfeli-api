import { User, UserRole } from '../../../src/user/entities/user.entity';
import { Tour } from '../../../src/tour/entities/tour.entity';
import { faker } from '@faker-js/faker';

export class EntityCreator {
  public static createTour(user: User): Tour {
    return {
      id: faker.datatype.uuid(),
      name: faker.lorem.sentence(2),
      images: [],
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      user: user,
      categories: [],
      description: faker.lorem.sentences(10),
      endLocation: null,
      startLocation: null,
      gpxFile: null,
      userId: user.id,
    };
  }

  public static createUser(isActive = true, isAdmin = false): User {
    return {
      id: faker.datatype.uuid(),
      email: faker.internet.email(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      isActive: isActive,
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      password: faker.internet.password(8),
      role: isAdmin ? UserRole.ADMINISTRATOR : UserRole.USER,
      tours: [],
      images: [],
      sessions: [],
      tokens: [],
      gpxFiles: [],
    };
  }
}
