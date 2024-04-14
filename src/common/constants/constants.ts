export enum ErrorCode {
  INVALID_JWT_TOKEN = 'INVALID_JWT_TOKEN',
  INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',
  COULD_NOT_CREATE_ACCOUNT = 'COULD_NOT_CREATE_ACCOUNT',
}

export enum ErrorMessage {
  INVALID_JWT_TOKEN = 'The token provided is invalid',
  INCORRECT_PASSWORD = 'The password provided is incorrect',
  COULD_NOT_CREATE_ACCOUNT = 'Failed to create account',
}

export const jwtConstants = {
  secret: 'iuAIHDFWBiwyb1124AFN11r4jk',
};
