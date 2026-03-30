import type { Storage } from "../storage.js";
import { EmailProviderRegistry } from "../providers/email/providerRegistry.js";

export class OutboundService {
  constructor(
    private readonly storage: Storage,
    private readonly emailProviders: EmailProviderRegistry,
  ) {}

  async verifyInboxConnection(inboxId: string): Promise<{ inboxId: string; provider: string; verifiedAt: string }> {
    const inbox = await this.storage.getInboxById(inboxId);
    if (!inbox) throw new Error(`Inbox not found: ${inboxId}`);
    await this.emailProviders.verify(inbox.provider);
    return {
      inboxId: inbox.id,
      provider: inbox.provider,
      verifiedAt: new Date().toISOString(),
    };
  }

  async processSendStepJob(payload: Record<string, unknown>): Promise<void> {
    const enrollmentId = String(payload.enrollmentId ?? "");
    const enrollment = await this.storage.getEnrollmentById(enrollmentId);
    if (!enrollment) throw new Error(`Enrollment not found: ${enrollmentId}`);

    const campaign = await this.storage.getCampaignById(enrollment.campaignId);
    const lead = await this.storage.getLeadById(enrollment.leadId);
    const inbox = await this.storage.getInboxById(enrollment.assignedInboxId);
    if (!campaign || !lead || !inbox) throw new Error(`Missing campaign, lead, or inbox for enrollment ${enrollmentId}`);

    const step = campaign.steps[enrollment.currentStepIndex];
    if (!step) throw new Error(`No current step for enrollment ${enrollmentId}`);

    const provider = this.emailProviders.get(inbox.provider) ?? this.emailProviders.getDefault();
    const thread = await this.findOrCreateThread(enrollment.id, lead.id, enrollment.assignedInboxId);
    const subject = this.render(step.subjectTemplate, lead);
    const bodyText = this.render(step.bodyTemplate, lead);
    const sendResult = await provider.send({
      from: inbox.displayName ? `${inbox.displayName} <${inbox.emailAddress}>` : inbox.emailAddress,
      to: lead.email,
      subject,
      text: bodyText,
      threadId: thread.id,
      replyTo: inbox.emailAddress,
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

    enrollment.lastOutboundSentAt = sendResult.acceptedAt;
    await this.storage.updateEnrollment(enrollment);

    inbox.sentToday += 1;
    inbox.lastSyncAt = sendResult.acceptedAt;
    await this.storage.updateInbox(inbox);
  }

  async sendTestEmail(input: { inboxId: string; to: string; subject: string; text: string; html?: string }): Promise<{ provider: string; providerMessageId: string; acceptedAt: string }> {
    const inbox = await this.storage.getInboxById(input.inboxId);
    if (!inbox) throw new Error(`Inbox not found: ${input.inboxId}`);
    const provider = this.emailProviders.get(inbox.provider) ?? this.emailProviders.getDefault();
    const result = await provider.send({
      from: inbox.displayName ? `${inbox.displayName} <${inbox.emailAddress}>` : inbox.emailAddress,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: inbox.emailAddress,
    });

    inbox.sentToday += 1;
    inbox.lastSyncAt = result.acceptedAt;
    await this.storage.updateInbox(inbox);
    return result;
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
      .replaceAll("{{firstName}}", lead.firstName ?? "there")
      .replaceAll("{{company}}", lead.company ?? "your company")
      .replaceAll("{{email}}", lead.email);
  }
}
