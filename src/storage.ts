import type { Account, Campaign, Enrollment, Inbox, Lead, Message, Thread } from "./domain.js";

export interface Storage {
  createAccount(input: Omit<Account, "id" | "createdAt">): Promise<Account>;
  getAccountById(id: string): Promise<Account | null>;

  createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">): Promise<Inbox>;
  getInboxById(id: string): Promise<Inbox | null>;
  updateInbox(inbox: Inbox): Promise<Inbox>;

  createLead(input: Omit<Lead, "id" | "status">): Promise<Lead>;
  getLeadById(id: string): Promise<Lead | null>;

  createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">): Promise<Campaign>;
  getCampaignById(id: string): Promise<Campaign | null>;
  updateCampaign(campaign: Campaign): Promise<Campaign>;

  createEnrollment(input: Omit<Enrollment, "id">): Promise<Enrollment>;
  getEnrollmentById(id: string): Promise<Enrollment | null>;
  updateEnrollment(enrollment: Enrollment): Promise<Enrollment>;
  listDueEnrollments(beforeIso: string): Promise<Enrollment[]>;

  createThread(input: Omit<Thread, "id">): Promise<Thread>;
  getThreadById(id: string): Promise<Thread | null>;
  findThreadByEnrollmentId(enrollmentId: string): Promise<Thread | null>;

  createMessage(input: Omit<Message, "id">): Promise<Message>;
  getMessageById(id: string): Promise<Message | null>;
  listMessagesByThreadId(threadId: string): Promise<Message[]>;
  updateMessage(message: Message): Promise<Message>;

  createSuppression(input: { accountId: string; email: string; reason: string }): Promise<{ id: string; accountId: string; email: string; reason: string }>;
  listCampaignsByAccountId(accountId: string): Promise<Campaign[]>;
  listEnrollmentsByCampaignId(campaignId: string): Promise<Enrollment[]>;
}
