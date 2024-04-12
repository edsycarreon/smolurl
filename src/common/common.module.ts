import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/apps/auth/auth.module';
import { LinksModule } from 'src/apps/links/links.module';
import commonConfig from 'src/config/common.config';

@Module({
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
