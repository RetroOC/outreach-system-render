import type { JobQueue, JobRecord } from "./types.js";

const makeId = () => `job_${Math.random().toString(36).slice(2, 10)}`;

export class InMemoryJobQueue implements JobQueue {
  private readonly jobs = new Map<string, JobRecord>();

  async enqueue(input: { kind: string; payload: Record<string, unknown>; availableAt?: string; maxAttempts?: number }): Promise<JobRecord> {
    const job: JobRecord = {
      id: makeId(),
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
    this.jobs.set(job.id, job);
    return job;
  }

  async claimAvailable(nowIso: string): Promise<JobRecord | null> {
    const now = new Date(nowIso).getTime();
    const job = Array.from(this.jobs.values()).find((item) => item.status === "pending" && new Date(item.availableAt).getTime() <= now);
    if (!job) return null;
    job.status = "processing";
    job.attempts += 1;
    job.lockedAt = new Date().toISOString();
    this.jobs.set(job.id, job);
    return job;
  }

  async markCompleted(id: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;
    job.status = "completed";
    job.completedAt = new Date().toISOString();
    this.jobs.set(id, job);
  }

  async markFailed(id: string, error: string): Promise<void> {
    const job = this.jobs.get(id);
    if (!job) return;
    job.error = error;
    job.status = job.attempts >= job.maxAttempts ? "failed" : "pending";
    this.jobs.set(id, job);
  }
}
