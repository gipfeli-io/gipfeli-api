import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database-config';

@Module({
  imports: [TypeOrmModule.forRoot(DatabaseConfig)],
})
export class InfrastructureModule {}
