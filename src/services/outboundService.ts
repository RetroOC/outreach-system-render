import type { Storage } from "../storage.js";
import type { EmailProvider } from "../providers/email/types.js";

export class OutboundService {
  constructor(
    private readonly storage: Storage,
    private readonly emailProvider: EmailProvider,
  ) {}

  async processSendStepJob(payload: Record<string, unknown>): Promise<void> {
    const enrollmentId = String(payload.enrollmentId ?? "");
    const enrollment = await this.storage.getEnrollmentById(enrollmentId);
    if (!enrollment) throw new Error(`Enrollment not found: ${enrollmentId}`);

    const campaign = await this.storage.getCampaignById(enrollment.campaignId);
    const lead = await this.storage.getLeadById(enrollment.leadId);
    if (!campaign || !lead) throw new Error(`Missing campaign or lead for enrollment ${enrollmentId}`);

    const step = campaign.steps[enrollment.currentStepIndex];
    if (!step) throw new Error(`No current step for enrollment ${enrollmentId}`);

    const thread = await this.findOrCreateThread(enrollment.id, lead.id, enrollment.assignedInboxId);
    const subject = this.render(step.subjectTemplate, lead);
    const bodyText = this.render(step.bodyTemplate, lead);
    const sendResult = await this.emailProvider.send({
      from: "noreply@example.com",
      to: lead.email,
      subject,
      text: bodyText,
      threadId: thread.id,
    });

    await this.storage.createMessage({
      threadId: thread.id,
      enrollmentId: enrollment.id,
      direction: "outbound",
      subject,
      bodyText,
      providerMessageId: sendResult.providerMessageId,
      sentAt: sendResult.acceptedAt,
    });
  }

  async ingestInboundMessage(input: {
    threadId: string;
    enrollmentId: string;
    subject: string;
    bodyText: string;
    providerMessageId?: string;
  }): Promise<void> {
    await this.storage.createMessage({
      threadId: input.threadId,
      enrollmentId: input.enrollmentId,
      direction: "inbound",
      subject: input.subject,
      bodyText: input.bodyText,
      providerMessageId: input.providerMessageId,
      receivedAt: new Date().toISOString(),
    });

    const enrollment = await this.storage.getEnrollmentById(input.enrollmentId);
    if (!enrollment) return;
    enrollment.state = "replied";
    enrollment.lastInboundReceivedAt = new Date().toISOString();
    enrollment.stopReason = "lead_replied";
    await this.storage.updateEnrollment(enrollment);
  }

  private async findOrCreateThread(enrollmentId: string, leadId: string, inboxId: string) {
    const existing = await this.storage.findThreadByEnrollmentId(enrollmentId);
    if (existing) return existing;
    return this.storage.createThread({
      enrollmentId,
      leadId,
      inboxId,
      state: "open",
      lastMessageAt: new Date().toISOString(),
    });
  }

  private render(template: string, lead: { firstName?: string; company?: string; email: string }) {
    return template
      .replaceAll("{{first_name}}", lead.firstName ?? "there")
      .replaceAll("{{company}}", lead.company ?? "your company")
      .replaceAll("{{email}}", lead.email);
  }
}
