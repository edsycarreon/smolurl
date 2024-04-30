import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { QueryResult, Pool } from 'pg';
import commonConfig from 'src/config/common.config';
import databaseConfig from 'src/config/database.config';

@Injectable()
export class DatabaseService {
  private readonly pool: Pool;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly database: ConfigType<typeof databaseConfig>,
    @Inject(commonConfig.KEY)
    private readonly config: ConfigType<typeof commonConfig>,
  ) {
    this.pool = new Pool({
      host: this.database.host,
      port: this.database.port,
      user: this.database.user,
      password: this.database.password,
      database: this.database.name,
      options: `-c search_path=${this.database.schema}`,
      ssl: this.config.isProduction,
    });
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const client = await this.pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}
