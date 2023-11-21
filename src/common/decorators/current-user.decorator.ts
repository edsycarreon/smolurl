import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerDTO } from 'src/dto/customer.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1]; // Assuming the token is sent in the Authorization header as "Bearer token"

    if (!token) {
      return null;
    }

    try {
      const jwtService = new JwtService({});
      const decodedToken = jwtService.decode(token) as { user: CustomerDTO };
      return decodedToken.user;
    } catch (error) {
      // Handle the case when the token is invalid or expired
      return null;
    }
  },
);
