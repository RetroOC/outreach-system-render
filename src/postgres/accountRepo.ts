import type { Account } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresAccountRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Account, "id" | "createdAt">): Promise<Account> {
    const account: Account = {
      id: makeId("acc"),
      name: input.name,
      settings: input.settings,
      createdAt: new Date().toISOString(),
    };

    await this.db.query({
      text: `insert into accounts (id, name, settings, created_at) values ($1, $2, $3::jsonb, $4)`,
      values: [account.id, account.name, JSON.stringify(account.settings), account.createdAt],
    });

    return account;
  }

  async getById(id: string): Promise<Account | null> {
    const result = await this.db.query<{ id: string; name: string; settings: Record<string, unknown>; created_at: string }>({
      text: `select id, name, settings, created_at from accounts where id = $1`,
      values: [id],
    });

    const row = result.rows[0];
    if (!row) return null;
    return { id: row.id, name: row.name, settings: row.settings, createdAt: row.created_at };
  }
}
