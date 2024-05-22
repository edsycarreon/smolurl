import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import commonConfig from '../config/common.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, commonConfig],
      isGlobal: true,
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
