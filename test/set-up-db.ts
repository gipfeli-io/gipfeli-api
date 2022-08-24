import { createConnection } from 'typeorm';
import { Seeder } from './utils/seeder';
/**
 * Ran before each of the testsuites is starting. Assures that we always have a
 * clean database for each testsuite.
 *
 * Because we are using dropSchema, migrationsRun and synchronize, there is no
 * need for having a afterAll() method that does cleanup tasks for the database.
 */
beforeAll(async () => {
  const connection = await createConnection({
    type: 'postgres',
    database: process.env.TYPEORM_DATABASE,
    port: parseInt(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    host: process.env.TYPEORM_HOST,
    dropSchema: true,
    migrationsRun: true,
    synchronize: true,
    entities: ['./**/*.entity{.ts,.js}'],
    name: 'test-setup',
  });

  const seeder = new Seeder(connection);
  await seeder.seedData();
  await connection.close();
});
