import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators';
import { Jwt } from 'src/utils';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: Jwt, private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.jwtService.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }

    request.externalUser = await this.jwtService.validateToken(token);
    return true;
  }
}
