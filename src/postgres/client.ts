import pg from "pg";
import type { SqlClient, SqlQuery } from "./types.js";

export class PgSqlClient implements SqlClient {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  async query<T = unknown>(query: SqlQuery): Promise<{ rows: T[] }> {
    const result = await this.pool.query(query.text, query.values);
    return { rows: result.rows as T[] };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
