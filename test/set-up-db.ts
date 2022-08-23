import { createConnection, getConnection } from 'typeorm';
import { Seeder } from './utils/seeder';
/**
 * Ran before each of the testsuites is starting. Assures that we always have a
 * clean database for each testsuite.
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

/**
 * Ran after each testsuite - make sure we clear all our databases.
 */
afterAll(async () => {
  const connection = getConnection();
  const entities = connection.entityMetadatas;
  for (const entity of entities) {
    const repository = connection.getRepository(entity.name);
    await repository.query(
      `TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`,
    );
  }

  await connection.close();
});
