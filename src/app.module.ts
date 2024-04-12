import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './apps/auth/auth.module';
import { LinksModule } from './apps/links/links.module';
import { CommonModule } from './common/common.module';
import databaseConfig from './config/database.config';
import commonConfig from './config/common.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, commonConfig],
    }),
    DatabaseModule,
    JwtModule,
    AuthModule,
    LinksModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
