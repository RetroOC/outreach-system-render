import type { JobQueue } from "./queue/types.js";
import { SchedulerService } from "./scheduler.js";
import { OutboundService } from "./services/outboundService.js";

export class WorkerRuntime {
  constructor(
    private readonly queue: JobQueue,
    private readonly scheduler: SchedulerService,
    private readonly outboundService: OutboundService,
  ) {}

  async tick(): Promise<{ queued: string[]; processed?: string }> {
    const scheduled = await this.scheduler.runDue();
    for (const enrollmentId of scheduled.queued) {
      await this.queue.enqueue({ kind: "send_campaign_step", payload: { enrollmentId } });
    }

    const job = await this.queue.claimAvailable(new Date().toISOString());
    if (!job) return { queued: scheduled.queued };

    try {
      if (job.kind === "send_campaign_step") {
        await this.outboundService.processSendStepJob(job.payload);
        const enrollmentId = String(job.payload.enrollmentId ?? "");
        if (enrollmentId) await this.scheduler.markSent(enrollmentId);
      } else if (job.kind === "ingest_inbound_message") {
        await this.outboundService.ingestInboundMessage({
          threadId: String(job.payload.threadId ?? ""),
          enrollmentId: String(job.payload.enrollmentId ?? ""),
          subject: String(job.payload.subject ?? ""),
          bodyText: String(job.payload.bodyText ?? ""),
          providerMessageId: typeof job.payload.providerMessageId === "string" ? job.payload.providerMessageId : undefined,
        });
      }
      await this.queue.markCompleted(job.id);
      return { queued: scheduled.queued, processed: job.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown worker error";
      await this.queue.markFailed(job.id, message);
      return { queued: scheduled.queued, processed: job.id };
    }
  }
}
