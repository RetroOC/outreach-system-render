import type { Message } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresMessageRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Message, "id">): Promise<Message> {
    const message: Message = { id: makeId("msg"), ...input };

    await this.db.query({
      text: `
        insert into messages (
          id, thread_id, enrollment_id, direction, subject, body_text,
          provider_message_id, received_at, sent_at, classification
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)
      `,
      values: [
        message.id,
        message.threadId,
        message.enrollmentId,
        message.direction,
        message.subject,
        message.bodyText,
        message.providerMessageId ?? null,
        message.receivedAt ?? null,
        message.sentAt ?? null,
        message.classification ? JSON.stringify(message.classification) : null,
      ],
    });

    return message;
  }
}
