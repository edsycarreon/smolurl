import { HttpStatus, ForbiddenException } from '@nestjs/common';

import { CustomErrorInterface } from './custom-error.type';
import { ErrorCode } from '../constants';

export const ACCOUNT_ALREADY_EXISTS: CustomErrorInterface = {
  status: HttpStatus.FORBIDDEN,
  code: ErrorCode.ACCOUNT_ALREADY_EXISTS,
  message: 'The email address or password provided is incorrect.',
};

export class AccountAlreadyExists extends ForbiddenException {
  constructor(message?: string) {
    ACCOUNT_ALREADY_EXISTS.message = message || ACCOUNT_ALREADY_EXISTS.message;

    super(
      ACCOUNT_ALREADY_EXISTS,
      'The email address or password provided is incorrect.',
    );
    Object.setPrototypeOf(this, AccountAlreadyExists.prototype);
  }
}
