import type { Lead } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresLeadRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Lead, "id" | "status">): Promise<Lead> {
    const lead: Lead = { id: makeId("lead"), status: "active", ...input };

    await this.db.query({
      text: `
        insert into leads (
          id, account_id, email, first_name, last_name, company, title, timezone, source, custom_fields, status
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11)
      `,
      values: [
        lead.id,
        lead.accountId,
        lead.email,
        lead.firstName ?? null,
        lead.lastName ?? null,
        lead.company ?? null,
        lead.title ?? null,
        lead.timezone ?? null,
        lead.source ?? null,
        JSON.stringify(lead.customFields),
        lead.status,
      ],
    });

    return lead;
  }
}
