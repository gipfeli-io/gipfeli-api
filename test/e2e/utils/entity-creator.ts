import { User, UserRole } from '../../../src/user/entities/user.entity';
import { Tour } from '../../../src/tour/entities/tour.entity';
import { Image } from '../../../src/media/entities/image.entity';

import { faker } from '@faker-js/faker';

export class EntityCreator {
  public static createTour(user: User, images: Image[] = []): Tour {
    return {
      id: faker.datatype.uuid(),
      name: faker.lorem.sentence(2),
      images: images,
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

  public static createImage(user: User = null, tour: Tour = null): Image {
    return {
      id: faker.datatype.uuid(),
      identifier: faker.lorem.sentence(1),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      user: user,
      location: null,
      userId: user?.id,
      tour: tour,
      tourId: tour?.id,
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
