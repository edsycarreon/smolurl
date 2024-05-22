import {
  createParamDecorator,
  ExecutionContext,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerDTO } from '../../dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return null;
    }

    try {
      const jwtService = new JwtService({});
      const decodedToken = jwtService.decode(token) as { user: CustomerDTO };
      return decodedToken.user;
    } catch (error) {
      Logger.error(
        `Token validation error: ${error.message}`,
        error.stack,
        'CurrentUserDecorator',
      );
      throw new UnauthorizedException('Failed to authenticate token.');
    }
  },
);
