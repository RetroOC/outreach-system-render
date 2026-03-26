import type { SqlClient } from "../postgres/types.js";
import { makeId } from "../postgres/helpers.js";
import type { JobQueue, JobRecord } from "./types.js";

export class PostgresJobQueue implements JobQueue {
  constructor(private readonly db: SqlClient) {}

  async enqueue(input: { kind: string; payload: Record<string, unknown>; availableAt?: string; maxAttempts?: number }): Promise<JobRecord> {
    const job: JobRecord = {
      id: makeId("job"),
      kind: input.kind,
      payload: input.payload,
      status: "pending",
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 5,
      availableAt: input.availableAt ?? new Date().toISOString(),
      lockedAt: null,
      completedAt: null,
      error: null,
      createdAt: new Date().toISOString(),
    };

    await this.db.query({
      text: `insert into jobs (id, kind, payload, status, attempts, max_attempts, available_at, created_at) values ($1,$2,$3::jsonb,$4,$5,$6,$7,$8)`,
      values: [job.id, job.kind, JSON.stringify(job.payload), job.status, job.attempts, job.maxAttempts, job.availableAt, job.createdAt],
    });

    return job;
  }

  async claimAvailable(nowIso: string): Promise<JobRecord | null> {
    const result = await this.db.query<any>({
      text: `
        update jobs
        set status = 'processing', attempts = attempts + 1, locked_at = now()
        where id = (
          select id from jobs
          where status = 'pending' and available_at <= $1
          order by available_at asc
          limit 1
        )
        returning *
      `,
      values: [nowIso],
    });

    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      kind: row.kind,
      payload: row.payload,
      status: row.status,
      attempts: row.attempts,
      maxAttempts: row.max_attempts,
      availableAt: row.available_at,
      lockedAt: row.locked_at,
      completedAt: row.completed_at,
      error: row.error,
      createdAt: row.created_at,
    };
  }

  async markCompleted(id: string): Promise<void> {
    await this.db.query({ text: `update jobs set status = 'completed', completed_at = now() where id = $1`, values: [id] });
  }

  async markFailed(id: string, error: string): Promise<void> {
    await this.db.query({
      text: `
        update jobs
        set error = $2,
            status = case when attempts >= max_attempts then 'failed' else 'pending' end
        where id = $1
      `,
      values: [id, error],
    });
  }
}
