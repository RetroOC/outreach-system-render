export type JobRecord = {
  id: string;
  kind: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  maxAttempts: number;
  availableAt: string;
  lockedAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
  createdAt?: string;
};

export interface JobQueue {
  enqueue(input: { kind: string; payload: Record<string, unknown>; availableAt?: string; maxAttempts?: number }): Promise<JobRecord>;
  claimAvailable(nowIso: string): Promise<JobRecord | null>;
  markCompleted(id: string): Promise<void>;
  markFailed(id: string, error: string): Promise<void>;
}
