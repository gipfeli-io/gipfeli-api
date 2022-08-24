import { User } from '../../../src/user/entities/user.entity';
import { Connection } from 'typeorm';
import { Tour } from '../../../src/tour/entities/tour.entity';
import { Seeds, SEEDS } from './seeds';

export class Seeder {
  private static readonly seeds: Seeds = SEEDS;
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  public static getSeeds(): Seeds {
    return Seeder.seeds;
  }

  public async seedData() {
    const users = await this.seedUsers();
    const tours = await this.seedTours(users);
  }

  private async seedUsers(): Promise<User[]> {
    const userRepository = this.connection.getRepository<User>(User);

    const entities = userRepository.create(Seeder.seeds.users);
    return await userRepository.save(entities);
  }

  private async seedTours(users: User[]) {
    const tourRepository = this.connection.getRepository<Tour>(Tour);

    const entities = tourRepository.create(Seeder.seeds.tours);
    entities[0].userId = users[0].id;
    entities[1].userId = users[1].id;

    return await tourRepository.save(entities);
  }
}
