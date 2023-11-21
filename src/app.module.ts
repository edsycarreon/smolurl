import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig],
    }),
    DatabaseModule,
    JwtModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
