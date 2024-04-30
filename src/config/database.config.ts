import { registerAs } from '@nestjs/config';

export default registerAs('databaseConfig', () => ({
  host: process.env.PGHOST,
  port: parseInt(process.env.PGPORT, 10) || 5432,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  name: process.env.PGDATABASE,
  schema: process.env.PGSCHEMA,
}));
