import * as path from 'path';
import * as dotenv from 'dotenv';
import { databaseConfig } from './database.config';

/**
 * This configuration file is used by the CLI from TypeOrm and cannot use the configService from nest.
 */
const dotenv_path = path.resolve(process.cwd(), `.env`);
dotenv.config({ path: dotenv_path });
const rootDir = process.env.NODE_ENV ? 'dist/' : './';

export const OrmConfig = {
  ...databaseConfig,
  migrationsTableName: 'migrations',
  migrations: [rootDir + 'migrations/*{.ts, .js}'],
  cli: {
    migrationsDir: rootDir + 'migrations',
  },
};

export default OrmConfig;
