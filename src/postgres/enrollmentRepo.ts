import type { Enrollment } from "../domain.js";
import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";

export class PostgresEnrollmentRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: Omit<Enrollment, "id">): Promise<Enrollment> {
    const enrollment: Enrollment = { id: makeId("enr"), ...input };

    await this.db.query({
      text: `
        insert into enrollments (
          id, campaign_id, lead_id, assigned_inbox_id, state, current_step_index,
          next_action_at, last_outbound_sent_at, last_inbound_received_at, stop_reason
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      `,
      values: [
        enrollment.id,
        enrollment.campaignId,
        enrollment.leadId,
        enrollment.assignedInboxId,
        enrollment.state,
        enrollment.currentStepIndex,
        enrollment.nextActionAt,
        enrollment.lastOutboundSentAt,
        enrollment.lastInboundReceivedAt,
        enrollment.stopReason,
      ],
    });

    return enrollment;
  }
}
