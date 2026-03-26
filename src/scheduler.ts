import type { Campaign, Enrollment, Inbox, Lead } from "./domain.js";
import type { Storage } from "./storage.js";

const toMs = (amount: number, unit: "minutes" | "hours" | "days") => {
  if (unit === "minutes") return amount * 60_000;
  if (unit === "hours") return amount * 3_600_000;
  return amount * 86_400_000;
};

export class SchedulerService {
  constructor(private readonly storage: Storage) {}

  async scheduleFirstStep(enrollment: Enrollment): Promise<Enrollment> {
    enrollment.nextActionAt = new Date(Date.now() + this.jitterMs(10)).toISOString();
    return this.storage.updateEnrollment(enrollment);
  }

  async runDue(now = new Date()): Promise<{ queued: string[] }> {
    const queued: string[] = [];
    const due = await this.storage.listDueEnrollments(now.toISOString());
    for (const enrollment of due) {
      const campaign = await this.storage.getCampaignById(enrollment.campaignId);
      const lead = await this.storage.getLeadById(enrollment.leadId);
      const inbox = await this.storage.getInboxById(enrollment.assignedInboxId);
      if (!campaign || !lead || !inbox) continue;
      if (!this.canSend(campaign, lead, inbox)) continue;
      queued.push(enrollment.id);
      enrollment.state = "processing";
      await this.storage.updateEnrollment(enrollment);
    }
    return { queued };
  }

  async markSent(enrollmentId: string): Promise<Enrollment | undefined> {
    const enrollment = await this.storage.getEnrollmentById(enrollmentId);
    if (!enrollment) return undefined;
    const campaign = await this.storage.getCampaignById(enrollment.campaignId);
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
    return this.storage.updateEnrollment(enrollment);
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
