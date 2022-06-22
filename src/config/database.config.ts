import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  const rootDir = process.env.NODE_ENV ? 'dist/' : './';

  return {
    type: 'postgres',
    database: process.env.TYPEORM_DATABASE,
    port: parseInt(process.env.TYPEORM_PORT),
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    host: process.env.TYPEORM_HOST,
    synchronize: false,
    entities: [rootDir + '**/*.entity{.ts,.js}'],
    autoLoadEntities: true,
  };
});
