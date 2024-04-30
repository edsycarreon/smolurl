import { registerAs } from '@nestjs/config';

export default registerAs('commonConfig', () => ({
  baseUrl: process.env.BASE_URL,
  isProduction: process.env.NODE_ENV === 'production',
}));
