import type { Inbox } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresInboxRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">): Promise<Inbox> {
    const inbox: Inbox = {
      id: makeId("inb"),
      authStatus: "pending",
      healthStatus: "healthy",
      sentToday: 0,
      reservedToday: 0,
      lastSyncAt: null,
      ...input,
    };

    await this.db.query({
      text: `
        insert into inboxes (
          id, account_id, email_address, provider, display_name, auth_status, health_status,
          daily_limit, hourly_limit, min_delay_seconds, sending_window, sent_today, reserved_today, last_sync_at
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13,$14)
      `,
      values: [
        inbox.id,
        inbox.accountId,
        inbox.emailAddress,
        inbox.provider,
        inbox.displayName ?? null,
        inbox.authStatus,
        inbox.healthStatus,
        inbox.dailyLimit,
        inbox.hourlyLimit,
        inbox.minDelaySeconds,
        JSON.stringify(inbox.sendingWindow),
        inbox.sentToday,
        inbox.reservedToday,
        inbox.lastSyncAt,
      ],
    });

    return inbox;
  }
}
