import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../common/auth/strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    NestJwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '1h' }, // Set your desired token expiration time
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtStrategy, NestJwtModule],
})
export class JwtModule {}
