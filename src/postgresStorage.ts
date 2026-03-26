import type { Storage } from "./storage.js";
import type { Account, Campaign, Enrollment, Inbox, Lead, Message, Thread } from "./domain.js";
import { PostgresAccountRepo } from "./postgres/accountRepo.js";
import { PostgresCampaignRepo } from "./postgres/campaignRepo.js";
import { PostgresEnrollmentRepo } from "./postgres/enrollmentRepo.js";
import { PostgresInboxRepo } from "./postgres/inboxRepo.js";
import { PostgresLeadRepo } from "./postgres/leadRepo.js";
import { PostgresMessageRepo } from "./postgres/messageRepo.js";
import { PostgresThreadRepo } from "./postgres/threadRepo.js";
import type { SqlClient } from "./postgres/types.js";

export class PostgresStorage implements Storage {
  private readonly accounts: PostgresAccountRepo;
  private readonly inboxes: PostgresInboxRepo;
  private readonly leads: PostgresLeadRepo;
  private readonly campaigns: PostgresCampaignRepo;
  private readonly enrollments: PostgresEnrollmentRepo;
  private readonly threads: PostgresThreadRepo;
  private readonly messages: PostgresMessageRepo;

  constructor(private readonly db: SqlClient) {
    this.accounts = new PostgresAccountRepo(db);
    this.inboxes = new PostgresInboxRepo(db);
    this.leads = new PostgresLeadRepo(db);
    this.campaigns = new PostgresCampaignRepo(db);
    this.enrollments = new PostgresEnrollmentRepo(db);
    this.threads = new PostgresThreadRepo(db);
    this.messages = new PostgresMessageRepo(db);
  }

  createAccount(input: Omit<Account, "id" | "createdAt">) { return this.accounts.create(input); }
  getAccountById(id: string) { return this.accounts.getById(id); }

  createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">) { return this.inboxes.create(input); }
  getInboxById(id: string) { return this.dbGetInbox(id); }
  updateInbox(inbox: Inbox) { return this.dbUpdateInbox(inbox); }

  createLead(input: Omit<Lead, "id" | "status">) { return this.leads.create(input); }
  getLeadById(id: string) { return this.dbGetLead(id); }

  createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">) { return this.campaigns.create(input); }
  getCampaignById(id: string) { return this.dbGetCampaign(id); }
  updateCampaign(campaign: Campaign) { return this.dbUpdateCampaign(campaign); }

  createEnrollment(input: Omit<Enrollment, "id">) { return this.enrollments.create(input); }
  getEnrollmentById(id: string) { return this.dbGetEnrollment(id); }
  updateEnrollment(enrollment: Enrollment) { return this.dbUpdateEnrollment(enrollment); }
  listDueEnrollments(beforeIso: string) { return this.dbListDueEnrollments(beforeIso); }

  createThread(input: Omit<Thread, "id">) { return this.threads.create(input); }
  getThreadById(id: string) { return this.dbGetThread(id); }

  createMessage(input: Omit<Message, "id">) { return this.messages.create(input); }
  getMessageById(id: string) { return this.dbGetMessage(id); }
  listMessagesByThreadId(threadId: string) { return this.dbListMessagesByThreadId(threadId); }
  updateMessage(message: Message) { return this.dbUpdateMessage(message); }

  private async dbGetInbox(id: string): Promise<Inbox | null> {
    const result = await this.db.query<any>({ text: `select * from inboxes where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      accountId: row.account_id,
      emailAddress: row.email_address,
      provider: row.provider,
      displayName: row.display_name ?? undefined,
      authStatus: row.auth_status,
      healthStatus: row.health_status,
      dailyLimit: row.daily_limit,
      hourlyLimit: row.hourly_limit,
      minDelaySeconds: row.min_delay_seconds,
      sendingWindow: row.sending_window,
      sentToday: row.sent_today,
      reservedToday: row.reserved_today,
      lastSyncAt: row.last_sync_at,
    };
  }

  private async dbUpdateInbox(inbox: Inbox): Promise<Inbox> {
    await this.db.query({
      text: `update inboxes set auth_status=$2, health_status=$3, sent_today=$4, reserved_today=$5, last_sync_at=$6 where id=$1`,
      values: [inbox.id, inbox.authStatus, inbox.healthStatus, inbox.sentToday, inbox.reservedToday, inbox.lastSyncAt],
    });
    return inbox;
  }

  private async dbGetLead(id: string): Promise<Lead | null> {
    const result = await this.db.query<any>({ text: `select * from leads where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      accountId: row.account_id,
      email: row.email,
      firstName: row.first_name ?? undefined,
      lastName: row.last_name ?? undefined,
      company: row.company ?? undefined,
      title: row.title ?? undefined,
      timezone: row.timezone ?? undefined,
      source: row.source ?? undefined,
      customFields: row.custom_fields,
      status: row.status,
    };
  }

  private async dbGetCampaign(id: string): Promise<Campaign | null> {
    const result = await this.db.query<any>({ text: `select * from campaigns where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    const steps = await this.db.query<any>({ text: `select * from campaign_steps where campaign_id = $1 order by step_number asc`, values: [id] });
    return {
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      status: row.status,
      objective: row.objective ?? undefined,
      settings: row.settings,
      scheduleVersion: row.schedule_version,
      steps: steps.rows.map((step) => ({
        stepNumber: step.step_number,
        type: step.type,
        delay: { kind: step.delay_kind, amount: step.delay_amount, unit: step.delay_unit },
        subjectTemplate: step.subject_template,
        bodyTemplate: step.body_template,
      })),
    };
  }

  private async dbUpdateCampaign(campaign: Campaign): Promise<Campaign> {
    await this.db.query({
      text: `update campaigns set name=$2, status=$3, objective=$4, settings=$5::jsonb, schedule_version=$6, updated_at=now() where id=$1`,
      values: [campaign.id, campaign.name, campaign.status, campaign.objective ?? null, JSON.stringify(campaign.settings), campaign.scheduleVersion],
    });
    return campaign;
  }

  private async dbGetEnrollment(id: string): Promise<Enrollment | null> {
    const result = await this.db.query<any>({ text: `select * from enrollments where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      campaignId: row.campaign_id,
      leadId: row.lead_id,
      assignedInboxId: row.assigned_inbox_id,
      state: row.state,
      currentStepIndex: row.current_step_index,
      nextActionAt: row.next_action_at,
      lastOutboundSentAt: row.last_outbound_sent_at,
      lastInboundReceivedAt: row.last_inbound_received_at,
      stopReason: row.stop_reason,
    };
  }

  private async dbUpdateEnrollment(enrollment: Enrollment): Promise<Enrollment> {
    await this.db.query({
      text: `update enrollments set state=$2, current_step_index=$3, next_action_at=$4, last_outbound_sent_at=$5, last_inbound_received_at=$6, stop_reason=$7, updated_at=now() where id=$1`,
      values: [enrollment.id, enrollment.state, enrollment.currentStepIndex, enrollment.nextActionAt, enrollment.lastOutboundSentAt, enrollment.lastInboundReceivedAt, enrollment.stopReason],
    });
    return enrollment;
  }

  private async dbListDueEnrollments(beforeIso: string): Promise<Enrollment[]> {
    const result = await this.db.query<any>({
      text: `select * from enrollments where state = 'active' and next_action_at <= $1 order by next_action_at asc`,
      values: [beforeIso],
    });
    return result.rows.map((row) => ({
      id: row.id,
      campaignId: row.campaign_id,
      leadId: row.lead_id,
      assignedInboxId: row.assigned_inbox_id,
      state: row.state,
      currentStepIndex: row.current_step_index,
      nextActionAt: row.next_action_at,
      lastOutboundSentAt: row.last_outbound_sent_at,
      lastInboundReceivedAt: row.last_inbound_received_at,
      stopReason: row.stop_reason,
    }));
  }

  private async dbGetThread(id: string): Promise<Thread | null> {
    const result = await this.db.query<any>({ text: `select * from threads where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      enrollmentId: row.enrollment_id,
      leadId: row.lead_id,
      inboxId: row.inbox_id,
      state: row.state,
      lastMessageAt: row.last_message_at,
    };
  }

  private async dbGetMessage(id: string): Promise<Message | null> {
    const result = await this.db.query<any>({ text: `select * from messages where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      threadId: row.thread_id,
      enrollmentId: row.enrollment_id,
      direction: row.direction,
      subject: row.subject,
      bodyText: row.body_text,
      providerMessageId: row.provider_message_id ?? undefined,
      receivedAt: row.received_at ?? undefined,
      sentAt: row.sent_at ?? undefined,
      classification: row.classification ?? undefined,
    };
  }

  private async dbListMessagesByThreadId(threadId: string): Promise<Message[]> {
    const result = await this.db.query<any>({ text: `select * from messages where thread_id = $1 order by created_at asc`, values: [threadId] });
    return result.rows.map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      enrollmentId: row.enrollment_id,
      direction: row.direction,
      subject: row.subject,
      bodyText: row.body_text,
      providerMessageId: row.provider_message_id ?? undefined,
      receivedAt: row.received_at ?? undefined,
      sentAt: row.sent_at ?? undefined,
      classification: row.classification ?? undefined,
    }));
  }

  private async dbUpdateMessage(message: Message): Promise<Message> {
    await this.db.query({
      text: `update messages set classification=$2::jsonb where id=$1`,
      values: [message.id, JSON.stringify(message.classification ?? null)],
    });
    return message;
  }
}
