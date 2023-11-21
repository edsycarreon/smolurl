// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret', // Replace with your secret key
    });
  }

  async validate(payload: JwtPayload) {
    // You can add additional validation here (e.g., checking if the user still exists in the database)
    return { userId: payload.id }; // This will be available as request.user in protected routes
  }
}
