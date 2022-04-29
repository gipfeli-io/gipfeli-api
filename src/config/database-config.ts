import * as path from 'path';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const env = process.env.NODE_ENV || 'development';
console.log('set env: ', process.env.NODE_ENV);
const dotenv_path = path.resolve(process.cwd(), `config/env/.${env}.env`);
dotenv.config({ path: dotenv_path });

export const DatabaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  host: process.env.TYPEORM_HOST,
  synchronize: false,
  entities: ['dist/**/*.entity{.ts,.js}'],
};

export default DatabaseConfig;
