import type { Account, Campaign, CampaignDetail, CampaignStats, Enrollment, Inbox, Lead, LeadImport, Message, Sequence, Thread, ThreadSummary } from "./domain.js";

export interface Storage {
  createAccount(input: Omit<Account, "id" | "createdAt">): Promise<Account>;
  getAccountById(id: string): Promise<Account | null>;
  listAccounts(): Promise<Account[]>;

  createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">): Promise<Inbox>;
  getInboxById(id: string): Promise<Inbox | null>;
  listInboxesByAccountId(accountId: string): Promise<Inbox[]>;
  updateInbox(inbox: Inbox): Promise<Inbox>;

  createLead(input: Omit<Lead, "id" | "status">): Promise<Lead>;
  getLeadById(id: string): Promise<Lead | null>;
  listLeadsByAccountId(accountId: string): Promise<Lead[]>;

  createLeadImport(input: Omit<LeadImport, "id" | "createdAt" | "updatedAt">): Promise<LeadImport>;
  getLeadImportById(id: string): Promise<LeadImport | null>;
  updateLeadImport(leadImport: LeadImport): Promise<LeadImport>;
  listLeadImportsByAccountId(accountId: string): Promise<LeadImport[]>;

  createSequence(input: Omit<Sequence, "id" | "createdAt" | "updatedAt">): Promise<Sequence>;
  getSequenceById(id: string): Promise<Sequence | null>;
  listSequencesByAccountId(accountId: string): Promise<Sequence[]>;
  updateSequence(sequence: Sequence): Promise<Sequence>;
  deleteSequence(id: string): Promise<boolean>;

  createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">): Promise<Campaign>;
  getCampaignById(id: string): Promise<Campaign | null>;
  getCampaignDetailById(id: string): Promise<CampaignDetail | null>;
  updateCampaign(campaign: Campaign): Promise<Campaign>;

  createEnrollment(input: Omit<Enrollment, "id">): Promise<Enrollment>;
  getEnrollmentById(id: string): Promise<Enrollment | null>;
  updateEnrollment(enrollment: Enrollment): Promise<Enrollment>;
  listDueEnrollments(beforeIso: string): Promise<Enrollment[]>;

  createThread(input: Omit<Thread, "id">): Promise<Thread>;
  getThreadById(id: string): Promise<Thread | null>;
  findThreadByEnrollmentId(enrollmentId: string): Promise<Thread | null>;
  listThreadsByAccountId(accountId: string): Promise<ThreadSummary[]>;
  listThreadsByInboxId(inboxId: string): Promise<ThreadSummary[]>;

  createMessage(input: Omit<Message, "id">): Promise<Message>;
  getMessageById(id: string): Promise<Message | null>;
  listMessagesByThreadId(threadId: string): Promise<Message[]>;
  listMessagesByAccountId(accountId: string): Promise<Message[]>;
  updateMessage(message: Message): Promise<Message>;

  createSuppression(input: { accountId: string; email: string; reason: string }): Promise<{ id: string; accountId: string; email: string; reason: string }>;
  listCampaignsByAccountId(accountId: string): Promise<Campaign[]>;
  listEnrollmentsByCampaignId(campaignId: string): Promise<Enrollment[]>;
  getCampaignStats(campaignId: string): Promise<CampaignStats>;
}
