import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * This configuration file is used by the CLI from TypeOrm and cannot use the configService from nest.
 */
const dotenv_path = path.resolve(process.cwd(), `.env`);
dotenv.config({ path: dotenv_path });
const rootDir = process.env.NODE_ENV ? 'dist/' : './';

export const OrmConfig = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  host: process.env.TYPEORM_HOST,
  synchronize: false,
  entities: [rootDir + '**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  migrationsTableName: 'migrations',
  migrations: [rootDir + 'migrations/*{.ts, .js}'],
  cli: {
    migrationsDir: rootDir + 'migrations',
  },
};

export default OrmConfig;
