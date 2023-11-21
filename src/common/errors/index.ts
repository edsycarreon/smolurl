import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { CustomErrorInterface } from './custom-error.type';
import { ErrorCode } from '../constants';

export const INVALID_JWT_TOKEN: CustomErrorInterface = {
  status: HttpStatus.UNAUTHORIZED,
  code: ErrorCode.INVALID_JWT_TOKEN,
  message: 'Token provided is invalid.',
};

export class InvalidJWTToken extends UnauthorizedException {
  constructor(message?: string) {
    INVALID_JWT_TOKEN.message = message || INVALID_JWT_TOKEN.message;

    super(INVALID_JWT_TOKEN, 'Invalid JWT Token provided');
    Object.setPrototypeOf(this, InvalidJWTToken.prototype);
  }
}
