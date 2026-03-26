import type { Campaign, Enrollment, Inbox, Lead } from "./domain.js";
import { InMemoryRepo } from "./repo.js";

const toMs = (amount: number, unit: "minutes" | "hours" | "days") => {
  if (unit === "minutes") return amount * 60_000;
  if (unit === "hours") return amount * 3_600_000;
  return amount * 86_400_000;
};

export class SchedulerService {
  constructor(private readonly repo: InMemoryRepo) {}

  scheduleFirstStep(enrollment: Enrollment): Enrollment {
    enrollment.nextActionAt = new Date(Date.now() + this.jitterMs(10)).toISOString();
    this.repo.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  runDue(now = new Date()): { queued: string[] } {
    const queued: string[] = [];
    for (const enrollment of this.repo.enrollments.values()) {
      if (enrollment.state !== "active") continue;
      if (new Date(enrollment.nextActionAt).getTime() > now.getTime()) continue;
      const campaign = this.repo.campaigns.get(enrollment.campaignId);
      const lead = this.repo.leads.get(enrollment.leadId);
      const inbox = this.repo.inboxes.get(enrollment.assignedInboxId);
      if (!campaign || !lead || !inbox) continue;
      if (!this.canSend(campaign, lead, inbox)) continue;
      queued.push(enrollment.id);
      enrollment.state = "processing";
      this.repo.enrollments.set(enrollment.id, enrollment);
    }
    return { queued };
  }

  markSent(enrollmentId: string): Enrollment | undefined {
    const enrollment = this.repo.enrollments.get(enrollmentId);
    if (!enrollment) return undefined;
    const campaign = this.repo.campaigns.get(enrollment.campaignId);
    if (!campaign) return undefined;
    enrollment.lastOutboundSentAt = new Date().toISOString();
    enrollment.currentStepIndex += 1;
    const nextStep = campaign.steps[enrollment.currentStepIndex];
    if (!nextStep) {
      enrollment.state = "completed";
      enrollment.stopReason = null;
    } else {
      enrollment.state = "active";
      const nextActionAt = new Date(Date.now() + toMs(nextStep.delay.amount, nextStep.delay.unit) + this.jitterMs(15));
      enrollment.nextActionAt = nextActionAt.toISOString();
    }
    this.repo.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  private canSend(_campaign: Campaign, lead: Lead, inbox: Inbox): boolean {
    if (lead.status !== "active") return false;
    if (inbox.authStatus !== "connected" && inbox.authStatus !== "pending") return false;
    if (inbox.healthStatus === "paused") return false;
    if (inbox.sentToday + inbox.reservedToday >= inbox.dailyLimit) return false;
    return true;
  }

  private jitterMs(maxMinutes: number) {
    return Math.floor(Math.random() * maxMinutes * 60_000);
  }
}
