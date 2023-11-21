import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import Pool, { QueryResult } from 'pg';
import databaseConfig from 'src/config/database.config';

@Injectable()
export class DatabaseService {
  private readonly pool: Pool;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly config: ConfigType<typeof databaseConfig>,
  ) {
    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.name,
    });
  }

  async query(text: string, params: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}
