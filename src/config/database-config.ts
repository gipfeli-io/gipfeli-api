import * as path from 'path';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const dotenv_path = path.resolve(process.cwd(), `.env`);
dotenv.config({ path: dotenv_path });
console.log('set env: ', process.env.TYPEORM_USERNAME);

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  host: process.env.TYPEORM_HOST,
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
};

export const OrmConfig = {
  ...DatabaseConfig,
  migrationsTableName: 'migrations',
  migrations: ['dist/migrations/*{.ts, .js}'],
  cli: {
    migrationsDir: 'dist/migrations',
  },
};

export default OrmConfig;
