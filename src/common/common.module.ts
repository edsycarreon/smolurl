import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/apps/auth/auth.module';
import commonConfig from 'src/config/common.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [commonConfig],
      isGlobal: true,
    }),
    AuthModule,
  ],
  exports: [AuthModule],
})
export class CommonModule {}
