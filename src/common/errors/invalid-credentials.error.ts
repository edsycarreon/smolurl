import { HttpStatus, UnauthorizedException } from '@nestjs/common';

import { CustomErrorInterface } from './custom-error.type';
import { ErrorCode } from '../constants';

export const INVALID_CREDENTIALS: CustomErrorInterface = {
  status: HttpStatus.UNAUTHORIZED,
  code: ErrorCode.INVALID_CREDENTIALS,
  message: 'The email address or password provided is incorrect.',
};

export class InvalidCredentials extends UnauthorizedException {
  constructor(message?: string) {
    INVALID_CREDENTIALS.message = message || INVALID_CREDENTIALS.message;

    super(
      INVALID_CREDENTIALS,
      'The email address or password provided is incorrect.',
    );
    Object.setPrototypeOf(this, InvalidCredentials.prototype);
  }
}
