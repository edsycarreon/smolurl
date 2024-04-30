import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from 'src/apps/auth/auth.module';
import commonConfig from 'src/config/common.config';
import { AuthGuard } from './guards/auth.guard';
import { LinksModule } from 'src/apps/links/links.module';

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
