import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresSuppressionRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: { accountId: string; email: string; reason: string }) {
    const record = { id: makeId("sup"), ...input };
    await this.db.query({
      text: `insert into suppressions (id, account_id, email, reason) values ($1,$2,$3,$4) on conflict (account_id, email) do update set reason = excluded.reason returning id`,
      values: [record.id, record.accountId, record.email, record.reason],
    });
    return record;
  }
}
