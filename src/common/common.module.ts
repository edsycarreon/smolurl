import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './guards/auth.guard';
import commonConfig from '../config/common.config';
import { AuthModule } from '../apps/auth/auth.module';
import { LinksModule } from '../apps/links/links.module';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot({
      load: [commonConfig],
      isGlobal: true,
    }),
    AuthModule,
    LinksModule,
  ],
  exports: [AuthModule, LinksModule],
})
export class CommonModule {}
