import type { Storage } from "./storage.js";
import type { Account, Campaign, CampaignDetail, CampaignStats, Enrollment, Inbox, Lead, LeadImport, Message, Sequence, Thread, ThreadSummary } from "./domain.js";
import { PostgresAccountRepo } from "./postgres/accountRepo.js";
import { PostgresCampaignRepo } from "./postgres/campaignRepo.js";
import { PostgresEnrollmentRepo } from "./postgres/enrollmentRepo.js";
import { PostgresInboxRepo } from "./postgres/inboxRepo.js";
import { PostgresLeadRepo } from "./postgres/leadRepo.js";
import { PostgresMessageRepo } from "./postgres/messageRepo.js";
import { PostgresThreadRepo } from "./postgres/threadRepo.js";
import { PostgresSuppressionRepo } from "./postgres/suppressionRepo.js";
import { makeId } from "./postgres/helpers.js";
import type { SqlClient } from "./postgres/types.js";

export class PostgresStorage implements Storage {
  private readonly accounts: PostgresAccountRepo;
  private readonly inboxes: PostgresInboxRepo;
  private readonly leads: PostgresLeadRepo;
  private readonly campaigns: PostgresCampaignRepo;
  private readonly enrollments: PostgresEnrollmentRepo;
  private readonly threads: PostgresThreadRepo;
  private readonly messages: PostgresMessageRepo;
  private readonly suppressions: PostgresSuppressionRepo;

  constructor(private readonly db: SqlClient) {
    this.accounts = new PostgresAccountRepo(db);
    this.inboxes = new PostgresInboxRepo(db);
    this.leads = new PostgresLeadRepo(db);
    this.campaigns = new PostgresCampaignRepo(db);
    this.enrollments = new PostgresEnrollmentRepo(db);
    this.threads = new PostgresThreadRepo(db);
    this.messages = new PostgresMessageRepo(db);
    this.suppressions = new PostgresSuppressionRepo(db);
  }

  createAccount(input: Omit<Account, "id" | "createdAt">) { return this.accounts.create(input); }
  getAccountById(id: string) { return this.accounts.getById(id); }
  listAccounts() { return this.dbListAccounts(); }

  createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">) { return this.inboxes.create(input); }
  getInboxById(id: string) { return this.dbGetInbox(id); }
  listInboxesByAccountId(accountId: string) { return this.dbListInboxesByAccountId(accountId); }
  updateInbox(inbox: Inbox) { return this.dbUpdateInbox(inbox); }

  createLead(input: Omit<Lead, "id" | "status">) { return this.leads.create(input); }
  getLeadById(id: string) { return this.dbGetLead(id); }
  listLeadsByAccountId(accountId: string) { return this.dbListLeadsByAccountId(accountId); }

  async createLeadImport(input: Omit<LeadImport, "id" | "createdAt" | "updatedAt">): Promise<LeadImport> {
    const leadImport: LeadImport = {
      id: makeId("imp"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...input,
    };
    await this.db.query({
      text: `
        insert into lead_imports (
          id, account_id, file_name, status, headers, sample_rows, total_rows, rows, mapping, custom_field_keys, tag_names, created_lead_ids, created_at, updated_at
        ) values ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14)
      `,
      values: [
        leadImport.id,
        leadImport.accountId,
        leadImport.fileName,
        leadImport.status,
        JSON.stringify(leadImport.headers),
        JSON.stringify(leadImport.sampleRows),
        leadImport.totalRows,
        JSON.stringify(leadImport.rows),
        JSON.stringify(leadImport.mapping),
        JSON.stringify(leadImport.customFieldKeys),
        JSON.stringify(leadImport.tagNames),
        JSON.stringify(leadImport.createdLeadIds),
        leadImport.createdAt,
        leadImport.updatedAt,
      ],
    });
    return leadImport;
  }
  getLeadImportById(id: string) { return this.dbGetLeadImport(id); }
  updateLeadImport(leadImport: LeadImport) { return this.dbUpdateLeadImport(leadImport); }
  listLeadImportsByAccountId(accountId: string) { return this.dbListLeadImportsByAccountId(accountId); }

  createSequence(input: Omit<Sequence, "id" | "createdAt" | "updatedAt">) { return this.dbCreateSequence(input); }
  getSequenceById(id: string) { return this.dbGetSequence(id); }
  listSequencesByAccountId(accountId: string) { return this.dbListSequencesByAccountId(accountId); }
  updateSequence(sequence: Sequence) { return this.dbUpdateSequence(sequence); }
  deleteSequence(id: string) { return this.dbDeleteSequence(id); }

  createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">) { return this.campaigns.create(input); }
  getCampaignById(id: string) { return this.dbGetCampaign(id); }
  getCampaignDetailById(id: string) { return this.dbGetCampaignDetail(id); }
  updateCampaign(campaign: Campaign) { return this.dbUpdateCampaign(campaign); }

  createEnrollment(input: Omit<Enrollment, "id">) { return this.enrollments.create(input); }
  getEnrollmentById(id: string) { return this.dbGetEnrollment(id); }
  updateEnrollment(enrollment: Enrollment) { return this.dbUpdateEnrollment(enrollment); }
  listDueEnrollments(beforeIso: string) { return this.dbListDueEnrollments(beforeIso); }

  createThread(input: Omit<Thread, "id">) { return this.threads.create(input); }
  getThreadById(id: string) { return this.dbGetThread(id); }
  findThreadByEnrollmentId(enrollmentId: string) { return this.dbFindThreadByEnrollmentId(enrollmentId); }
  listThreadsByAccountId(accountId: string) { return this.dbListThreadSummaries({ accountId }); }
  listThreadsByInboxId(inboxId: string) { return this.dbListThreadSummaries({ inboxId }); }

  createMessage(input: Omit<Message, "id">) { return this.messages.create(input); }
  getMessageById(id: string) { return this.dbGetMessage(id); }
  listMessagesByThreadId(threadId: string) { return this.dbListMessagesByThreadId(threadId); }
  listMessagesByAccountId(accountId: string) { return this.dbListMessagesByAccountId(accountId); }
  updateMessage(message: Message) { return this.dbUpdateMessage(message); }
  createSuppression(input: { accountId: string; email: string; reason: string }) { return this.suppressions.create(input); }
  listCampaignsByAccountId(accountId: string) { return this.dbListCampaignsByAccountId(accountId); }
  listEnrollmentsByCampaignId(campaignId: string) { return this.dbListEnrollmentsByCampaignId(campaignId); }
  getCampaignStats(campaignId: string) { return this.dbGetCampaignStats(campaignId); }

  private mapAccount(row: any): Account {
    return { id: row.id, name: row.name, settings: row.settings, createdAt: row.created_at };
  }

  private mapInbox(row: any): Inbox {
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

  private mapLead(row: any): Lead {
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
      tags: row.tags ?? [],
      status: row.status,
    };
  }

  private mapLeadImport(row: any): LeadImport {
    return {
      id: row.id,
      accountId: row.account_id,
      fileName: row.file_name,
      status: row.status,
      headers: row.headers ?? [],
      sampleRows: row.sample_rows ?? [],
      totalRows: row.total_rows,
      rows: row.rows ?? [],
      mapping: row.mapping ?? {},
      customFieldKeys: row.custom_field_keys ?? [],
      tagNames: row.tag_names ?? [],
      createdLeadIds: row.created_lead_ids ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapCampaign(row: any, stepsRows: any[]): Campaign {
    return {
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      status: row.status,
      objective: row.objective ?? undefined,
      settings: row.settings,
      schedule: row.schedule,
      scheduleVersion: row.schedule_version,
      steps: stepsRows.map((step) => ({
        stepNumber: step.step_number,
        type: step.type,
        delay: { kind: step.delay_kind, amount: step.delay_amount, unit: step.delay_unit },
        subjectTemplate: step.subject_template,
        bodyTemplate: step.body_template,
      })),
    };
  }

  private mapSequence(row: any, stepsRows: any[]): Sequence {
    return {
      id: row.id,
      accountId: row.account_id,
      name: row.name,
      objective: row.objective ?? undefined,
      status: row.status,
      settings: row.settings,
      steps: stepsRows.map((step) => ({
        stepNumber: step.step_number,
        type: step.type,
        delay: { kind: step.delay_kind, amount: step.delay_amount, unit: step.delay_unit },
        subjectTemplate: step.subject_template,
        bodyTemplate: step.body_template,
      })),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapEnrollment(row: any): Enrollment {
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

  private mapThread(row: any): Thread {
    return {
      id: row.id,
      enrollmentId: row.enrollment_id,
      leadId: row.lead_id,
      inboxId: row.inbox_id,
      state: row.state,
      lastMessageAt: row.last_message_at,
    };
  }

  private mapMessage(row: any): Message {
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

  private async dbListAccounts(): Promise<Account[]> {
    const result = await this.db.query<any>({ text: `select id, name, settings, created_at from accounts order by created_at desc` });
    return result.rows.map((row) => this.mapAccount(row));
  }

  private async dbGetInbox(id: string): Promise<Inbox | null> {
    const result = await this.db.query<any>({ text: `select * from inboxes where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapInbox(row) : null;
  }

  private async dbListInboxesByAccountId(accountId: string): Promise<Inbox[]> {
    const result = await this.db.query<any>({ text: `select * from inboxes where account_id = $1 order by created_at desc`, values: [accountId] });
    return result.rows.map((row) => this.mapInbox(row));
  }

  private async dbUpdateInbox(inbox: Inbox): Promise<Inbox> {
    await this.db.query({
      text: `update inboxes set email_address=$2, provider=$3, display_name=$4, auth_status=$5, health_status=$6, daily_limit=$7, hourly_limit=$8, min_delay_seconds=$9, sending_window=$10::jsonb, sent_today=$11, reserved_today=$12, last_sync_at=$13 where id=$1`,
      values: [inbox.id, inbox.emailAddress, inbox.provider, inbox.displayName ?? null, inbox.authStatus, inbox.healthStatus, inbox.dailyLimit, inbox.hourlyLimit, inbox.minDelaySeconds, JSON.stringify(inbox.sendingWindow), inbox.sentToday, inbox.reservedToday, inbox.lastSyncAt],
    });
    return inbox;
  }

  private async dbGetLead(id: string): Promise<Lead | null> {
    const result = await this.db.query<any>({ text: `select * from leads where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapLead(row) : null;
  }

  private async dbListLeadsByAccountId(accountId: string): Promise<Lead[]> {
    const result = await this.db.query<any>({ text: `select * from leads where account_id = $1 order by updated_at desc, created_at desc`, values: [accountId] });
    return result.rows.map((row) => this.mapLead(row));
  }

  private async dbGetLeadImport(id: string): Promise<LeadImport | null> {
    const result = await this.db.query<any>({ text: `select * from lead_imports where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapLeadImport(row) : null;
  }

  private async dbUpdateLeadImport(leadImport: LeadImport): Promise<LeadImport> {
    const updatedAt = new Date().toISOString();
    await this.db.query({
      text: `
        update lead_imports
        set status=$2, headers=$3::jsonb, sample_rows=$4::jsonb, total_rows=$5, rows=$6::jsonb, mapping=$7::jsonb, custom_field_keys=$8::jsonb, tag_names=$9::jsonb, created_lead_ids=$10::jsonb, updated_at=$11
        where id=$1
      `,
      values: [
        leadImport.id,
        leadImport.status,
        JSON.stringify(leadImport.headers),
        JSON.stringify(leadImport.sampleRows),
        leadImport.totalRows,
        JSON.stringify(leadImport.rows),
        JSON.stringify(leadImport.mapping),
        JSON.stringify(leadImport.customFieldKeys),
        JSON.stringify(leadImport.tagNames),
        JSON.stringify(leadImport.createdLeadIds),
        updatedAt,
      ],
    });
    return { ...leadImport, updatedAt };
  }

  private async dbListLeadImportsByAccountId(accountId: string): Promise<LeadImport[]> {
    const result = await this.db.query<any>({ text: `select * from lead_imports where account_id = $1 order by created_at desc`, values: [accountId] });
    return result.rows.map((row) => this.mapLeadImport(row));
  }

  private async dbCreateSequence(input: Omit<Sequence, "id" | "createdAt" | "updatedAt">): Promise<Sequence> {
    const sequence: Sequence = {
      id: makeId("seq"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...input,
    };

    await this.db.query({
      text: `insert into sequences (id, account_id, name, objective, status, settings, created_at, updated_at) values ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)`,
      values: [sequence.id, sequence.accountId, sequence.name, sequence.objective ?? null, sequence.status, JSON.stringify(sequence.settings), sequence.createdAt, sequence.updatedAt],
    });
    for (const step of sequence.steps) {
      await this.db.query({
        text: `insert into sequence_steps (id, sequence_id, step_number, type, delay_kind, delay_amount, delay_unit, subject_template, body_template) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        values: [makeId("sst"), sequence.id, step.stepNumber, step.type, step.delay.kind, step.delay.amount, step.delay.unit, step.subjectTemplate, step.bodyTemplate],
      });
    }
    return sequence;
  }

  private async dbGetSequence(id: string): Promise<Sequence | null> {
    const result = await this.db.query<any>({ text: `select * from sequences where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    const steps = await this.db.query<any>({ text: `select * from sequence_steps where sequence_id = $1 order by step_number asc`, values: [id] });
    return this.mapSequence(row, steps.rows);
  }

  private async dbListSequencesByAccountId(accountId: string): Promise<Sequence[]> {
    const result = await this.db.query<any>({ text: `select id from sequences where account_id = $1 order by updated_at desc, created_at desc`, values: [accountId] });
    const sequences = await Promise.all(result.rows.map((row) => this.dbGetSequence(row.id)));
    return sequences.filter((item): item is Sequence => Boolean(item));
  }

  private async dbUpdateSequence(sequence: Sequence): Promise<Sequence> {
    const updatedAt = new Date().toISOString();
    await this.db.query({
      text: `update sequences set name=$2, objective=$3, status=$4, settings=$5::jsonb, updated_at=$6 where id=$1`,
      values: [sequence.id, sequence.name, sequence.objective ?? null, sequence.status, JSON.stringify(sequence.settings), updatedAt],
    });
    await this.db.query({ text: `delete from sequence_steps where sequence_id = $1`, values: [sequence.id] });
    for (const step of sequence.steps) {
      await this.db.query({
        text: `insert into sequence_steps (id, sequence_id, step_number, type, delay_kind, delay_amount, delay_unit, subject_template, body_template) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        values: [makeId("sst"), sequence.id, step.stepNumber, step.type, step.delay.kind, step.delay.amount, step.delay.unit, step.subjectTemplate, step.bodyTemplate],
      });
    }
    return { ...sequence, updatedAt };
  }

  private async dbDeleteSequence(id: string): Promise<boolean> {
    const existing = await this.dbGetSequence(id);
    if (!existing) return false;
    await this.db.query({ text: `delete from sequences where id = $1`, values: [id] });
    return true;
  }

  private async dbGetCampaign(id: string): Promise<Campaign | null> {
    const result = await this.db.query<any>({ text: `select * from campaigns where id = $1`, values: [id] });
    const row = result.rows[0];
    if (!row) return null;
    const steps = await this.db.query<any>({ text: `select * from campaign_steps where campaign_id = $1 order by step_number asc`, values: [id] });
    return this.mapCampaign(row, steps.rows);
  }

  private async dbGetCampaignDetail(id: string): Promise<CampaignDetail | null> {
    const campaign = await this.dbGetCampaign(id);
    if (!campaign) return null;
    const linkedSequenceId = typeof campaign.settings.sourceSequenceId === "string" ? campaign.settings.sourceSequenceId : null;
    return {
      campaign,
      stats: await this.dbGetCampaignStats(id),
      enrollments: await this.dbListEnrollmentsByCampaignId(id),
      linkedSequence: linkedSequenceId ? await this.dbGetSequence(linkedSequenceId) : null,
    };
  }

  private async dbUpdateCampaign(campaign: Campaign): Promise<Campaign> {
    await this.db.query({
      text: `update campaigns set name=$2, status=$3, objective=$4, settings=$5::jsonb, schedule=$6::jsonb, schedule_version=$7, updated_at=now() where id=$1`,
      values: [campaign.id, campaign.name, campaign.status, campaign.objective ?? null, JSON.stringify(campaign.settings), JSON.stringify(campaign.schedule), campaign.scheduleVersion],
    });
    return campaign;
  }

  private async dbGetEnrollment(id: string): Promise<Enrollment | null> {
    const result = await this.db.query<any>({ text: `select * from enrollments where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapEnrollment(row) : null;
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
    return result.rows.map((row) => this.mapEnrollment(row));
  }

  private async dbGetThread(id: string): Promise<Thread | null> {
    const result = await this.db.query<any>({ text: `select * from threads where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapThread(row) : null;
  }

  private async dbFindThreadByEnrollmentId(enrollmentId: string): Promise<Thread | null> {
    const result = await this.db.query<any>({ text: `select * from threads where enrollment_id = $1 limit 1`, values: [enrollmentId] });
    const row = result.rows[0];
    return row ? this.mapThread(row) : null;
  }

  private async dbListThreadSummaries(filter: { accountId?: string; inboxId?: string }): Promise<ThreadSummary[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    if (filter.accountId) {
      values.push(filter.accountId);
      conditions.push(`i.account_id = $${values.length}`);
    }
    if (filter.inboxId) {
      values.push(filter.inboxId);
      conditions.push(`t.inbox_id = $${values.length}`);
    }
    const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
    const result = await this.db.query<any>({
      text: `
        select
          t.id as thread_id,
          t.enrollment_id,
          t.lead_id,
          t.inbox_id,
          t.state as thread_state,
          t.last_message_at,
          l.id as lead_ref_id,
          l.account_id as lead_account_id,
          l.email as lead_email,
          l.first_name,
          l.last_name,
          l.company,
          l.title,
          l.timezone,
          l.source,
          l.custom_fields,
          l.tags,
          l.status as lead_status,
          i.id as inbox_ref_id,
          i.account_id as inbox_account_id,
          i.email_address,
          i.provider,
          i.display_name,
          i.auth_status,
          i.health_status,
          i.daily_limit,
          i.hourly_limit,
          i.min_delay_seconds,
          i.sending_window,
          i.sent_today,
          i.reserved_today,
          i.last_sync_at,
          c.id as campaign_id,
          c.name as campaign_name,
          c.status as campaign_status,
          c.objective as campaign_objective,
          c.settings as campaign_settings,
          c.schedule as campaign_schedule,
          c.schedule_version,
          m.id as message_id,
          m.direction as message_direction,
          m.subject as message_subject,
          m.body_text as message_body_text,
          m.provider_message_id,
          m.received_at,
          m.sent_at,
          m.classification,
          coalesce(mc.message_count, 0) as message_count,
          coalesce(mc.unread_count, 0) as unread_count
        from threads t
        join inboxes i on i.id = t.inbox_id
        left join leads l on l.id = t.lead_id
        left join enrollments e on e.id = t.enrollment_id
        left join campaigns c on c.id = e.campaign_id
        left join lateral (
          select * from messages mx where mx.thread_id = t.id order by coalesce(mx.received_at, mx.sent_at, mx.created_at) desc limit 1
        ) m on true
        left join lateral (
          select count(*)::int as message_count, count(*) filter (where direction = 'inbound')::int as unread_count from messages mm where mm.thread_id = t.id
        ) mc on true
        ${where}
        order by t.last_message_at desc
      `,
      values,
    });

    return result.rows.map((row) => ({
      thread: {
        id: row.thread_id,
        enrollmentId: row.enrollment_id,
        leadId: row.lead_id,
        inboxId: row.inbox_id,
        state: row.thread_state,
        lastMessageAt: row.last_message_at,
      },
      lead: row.lead_ref_id ? {
        id: row.lead_ref_id,
        accountId: row.lead_account_id,
        email: row.lead_email,
        firstName: row.first_name ?? undefined,
        lastName: row.last_name ?? undefined,
        company: row.company ?? undefined,
        title: row.title ?? undefined,
        timezone: row.timezone ?? undefined,
        source: row.source ?? undefined,
        customFields: row.custom_fields ?? {},
        tags: row.tags ?? [],
        status: row.lead_status,
      } : null,
      inbox: row.inbox_ref_id ? {
        id: row.inbox_ref_id,
        accountId: row.inbox_account_id,
        emailAddress: row.email_address,
        provider: row.provider,
        displayName: row.display_name ?? undefined,
        authStatus: row.auth_status,
        healthStatus: row.health_status,
        dailyLimit: row.daily_limit,
        hourlyLimit: row.hourly_limit,
        minDelaySeconds: row.min_delay_seconds,
        sendingWindow: row.sending_window ?? {},
        sentToday: row.sent_today,
        reservedToday: row.reserved_today,
        lastSyncAt: row.last_sync_at,
      } : null,
      campaign: row.campaign_id ? {
        id: row.campaign_id,
        accountId: row.inbox_account_id,
        name: row.campaign_name,
        status: row.campaign_status,
        objective: row.campaign_objective ?? undefined,
        settings: row.campaign_settings ?? {},
        schedule: row.campaign_schedule ?? { timezone: "UTC", allowedDays: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 },
        scheduleVersion: row.schedule_version ?? 1,
        steps: [],
      } : null,
      latestMessage: row.message_id ? {
        id: row.message_id,
        threadId: row.thread_id,
        enrollmentId: row.enrollment_id,
        direction: row.message_direction,
        subject: row.message_subject,
        bodyText: row.message_body_text,
        providerMessageId: row.provider_message_id ?? undefined,
        receivedAt: row.received_at ?? undefined,
        sentAt: row.sent_at ?? undefined,
        classification: row.classification ?? undefined,
      } : null,
      messageCount: row.message_count,
      unreadCount: row.unread_count,
    }));
  }

  private async dbGetMessage(id: string): Promise<Message | null> {
    const result = await this.db.query<any>({ text: `select * from messages where id = $1`, values: [id] });
    const row = result.rows[0];
    return row ? this.mapMessage(row) : null;
  }

  private async dbListMessagesByThreadId(threadId: string): Promise<Message[]> {
    const result = await this.db.query<any>({ text: `select * from messages where thread_id = $1 order by created_at asc`, values: [threadId] });
    return result.rows.map((row) => this.mapMessage(row));
  }

  private async dbListMessagesByAccountId(accountId: string): Promise<Message[]> {
    const result = await this.db.query<any>({
      text: `select m.* from messages m join threads t on t.id = m.thread_id join inboxes i on i.id = t.inbox_id where i.account_id = $1 order by coalesce(m.received_at, m.sent_at, m.created_at) desc`,
      values: [accountId],
    });
    return result.rows.map((row) => this.mapMessage(row));
  }

  private async dbUpdateMessage(message: Message): Promise<Message> {
    await this.db.query({
      text: `update messages set classification=$2::jsonb where id=$1`,
      values: [message.id, JSON.stringify(message.classification ?? null)],
    });
    return message;
  }

  private async dbListCampaignsByAccountId(accountId: string): Promise<Campaign[]> {
    const result = await this.db.query<any>({ text: `select id from campaigns where account_id = $1 order by created_at desc`, values: [accountId] });
    const campaigns = await Promise.all(result.rows.map((row) => this.dbGetCampaign(row.id)));
    return campaigns.filter((item): item is Campaign => Boolean(item));
  }

  private async dbListEnrollmentsByCampaignId(campaignId: string): Promise<Enrollment[]> {
    const result = await this.db.query<any>({ text: `select * from enrollments where campaign_id = $1 order by created_at desc`, values: [campaignId] });
    return result.rows.map((row) => this.mapEnrollment(row));
  }

  private async dbGetCampaignStats(campaignId: string): Promise<CampaignStats> {
    const enrollments = await this.dbListEnrollmentsByCampaignId(campaignId);
    return {
      campaignId,
      enrolled: enrollments.length,
      active: enrollments.filter((item) => item.state === "active").length,
      completed: enrollments.filter((item) => item.state === "completed").length,
      replied: enrollments.filter((item) => item.state === "replied").length,
      bounced: enrollments.filter((item) => item.state === "bounced").length,
      unsubscribed: enrollments.filter((item) => item.state === "unsubscribed").length,
      failed: enrollments.filter((item) => item.state === "failed").length,
    };
  }
}
