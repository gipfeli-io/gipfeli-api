import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { registerAs } from '@nestjs/config';

/**
 * We export this configuration so that we can reuse it in orm.config.ts, which does not use nest.js' configservice.
 */
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  database: process.env.TYPEORM_DATABASE,
  port: parseInt(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  host: process.env.TYPEORM_HOST,
  synchronize: false,
  entities: [(process.env.NODE_ENV ? 'dist/' : './') + '**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
};

export default registerAs('database', () => databaseConfig);
