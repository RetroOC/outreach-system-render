import type { SqlClient } from "./types.js";
import { makeId } from "./helpers.js";
import type { AiTaskName, ProviderName } from "../types.js";

export type AiRunRecord = {
  accountId?: string;
  taskName: AiTaskName;
  promptVersion: string;
  schemaVersion?: string;
  provider: ProviderName;
  model: string;
  status: "success" | "failed";
  confidence?: number;
  latencyMs: number;
  estimatedCostUsd?: number;
  inputHash?: string;
  errorCode?: string;
  errorMessage?: string;
  metadata?: Record<string, string>;
};

export class PostgresAiRunRepo {
  constructor(private readonly db: SqlClient) {}

  async create(input: AiRunRecord): Promise<{ id: string }> {
    const id = makeId("air");
    await this.db.query({
      text: `
        insert into ai_runs (
          id, account_id, task_name, prompt_version, schema_version, provider, model, status,
          confidence, latency_ms, estimated_cost_usd, input_hash, error_code, error_message, metadata
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb)
      `,
      values: [
        id,
        input.accountId ?? null,
        input.taskName,
        input.promptVersion,
        input.schemaVersion ?? null,
        input.provider,
        input.model,
        input.status,
        input.confidence ?? null,
        input.latencyMs,
        input.estimatedCostUsd ?? null,
        input.inputHash ?? null,
        input.errorCode ?? null,
        input.errorMessage ?? null,
        JSON.stringify(input.metadata ?? {}),
      ],
    });
    return { id };
  }
}
