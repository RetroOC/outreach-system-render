import type { Thread } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresThreadRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Thread, "id">): Promise<Thread> {
    const thread: Thread = { id: makeId("thr"), ...input };

    await this.db.query({
      text: `insert into threads (id, enrollment_id, lead_id, inbox_id, state, last_message_at) values ($1,$2,$3,$4,$5,$6)`,
      values: [thread.id, thread.enrollmentId, thread.leadId, thread.inboxId, thread.state, thread.lastMessageAt],
    });

    return thread;
  }
}
