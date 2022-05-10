import * as path from 'path';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const dotenv_path = path.resolve(process.cwd(), `.env`);
dotenv.config({ path: dotenv_path });
const rootDir = process.env.NODE_ENV ? 'dist' : 'src';
console.log('rootDir', rootDir);
console.log('env', process.env.NODE_ENV);
export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  extra: {
    socketPath: process.env.TYPEORM_HOST,
  },
  synchronize: true,
  entities: [rootDir + '/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
};

export const OrmConfig = {
  ...DatabaseConfig,
  migrationsTableName: 'migrations',
  migrations: [rootDir + '/migrations/*{.ts, .js}'],
  cli: {
    migrationsDir: rootDir + '/migrations',
  },
};

export default OrmConfig;
