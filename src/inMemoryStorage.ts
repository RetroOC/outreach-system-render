import type { Storage } from "./storage.js";
import type { Account, Campaign, CampaignDetail, CampaignStats, Enrollment, Inbox, Lead, LeadImport, Message, Sequence, Thread, ThreadSummary } from "./domain.js";
import { InMemoryRepo } from "./repo.js";

const makeId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export class InMemoryStorage implements Storage {
  constructor(private readonly repo: InMemoryRepo) {}

  async createAccount(input: Omit<Account, "id" | "createdAt">) { return this.repo.createAccount(input); }
  async getAccountById(id: string) { return this.repo.accounts.get(id) ?? null; }
  async listAccounts() { return Array.from(this.repo.accounts.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  async createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">) { return this.repo.createInbox(input); }
  async getInboxById(id: string) { return this.repo.inboxes.get(id) ?? null; }
  async listInboxesByAccountId(accountId: string) { return Array.from(this.repo.inboxes.values()).filter((item) => item.accountId === accountId); }
  async updateInbox(inbox: Inbox) { this.repo.inboxes.set(inbox.id, inbox); return inbox; }

  async createLead(input: Omit<Lead, "id" | "status">) { return this.repo.createLead(input); }
  async getLeadById(id: string) { return this.repo.leads.get(id) ?? null; }
  async listLeadsByAccountId(accountId: string) { return Array.from(this.repo.leads.values()).filter((item) => item.accountId === accountId); }

  async createLeadImport(input: Omit<LeadImport, "id" | "createdAt" | "updatedAt">) { return this.repo.createLeadImport(input); }
  async getLeadImportById(id: string) { return this.repo.leadImports.get(id) ?? null; }
  async updateLeadImport(leadImport: LeadImport) {
    const next = { ...leadImport, updatedAt: new Date().toISOString() };
    this.repo.leadImports.set(next.id, next);
    return next;
  }
  async listLeadImportsByAccountId(accountId: string) { return Array.from(this.repo.leadImports.values()).filter((item) => item.accountId === accountId); }

  async createSequence(input: Omit<Sequence, "id" | "createdAt" | "updatedAt">) { return this.repo.createSequence(input); }
  async getSequenceById(id: string) { return this.repo.sequences.get(id) ?? null; }
  async listSequencesByAccountId(accountId: string) { return Array.from(this.repo.sequences.values()).filter((item) => item.accountId === accountId); }
  async updateSequence(sequence: Sequence) {
    const next = { ...sequence, updatedAt: new Date().toISOString() };
    this.repo.sequences.set(next.id, next);
    return next;
  }
  async deleteSequence(id: string) { return this.repo.sequences.delete(id); }

  async createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">) { return this.repo.createCampaign(input); }
  async getCampaignById(id: string) { return this.repo.campaigns.get(id) ?? null; }
  async getCampaignDetailById(id: string): Promise<CampaignDetail | null> {
    const campaign = await this.getCampaignById(id);
    if (!campaign) return null;
    const linkedSequenceId = typeof campaign.settings.sourceSequenceId === "string" ? campaign.settings.sourceSequenceId : null;
    return {
      campaign,
      stats: await this.getCampaignStats(id),
      enrollments: await this.listEnrollmentsByCampaignId(id),
      linkedSequence: linkedSequenceId ? await this.getSequenceById(linkedSequenceId) : null,
    };
  }
  async updateCampaign(campaign: Campaign) { this.repo.campaigns.set(campaign.id, campaign); return campaign; }

  async createEnrollment(input: Omit<Enrollment, "id">) { return this.repo.createEnrollment(input); }
  async getEnrollmentById(id: string) { return this.repo.enrollments.get(id) ?? null; }
  async updateEnrollment(enrollment: Enrollment) { this.repo.enrollments.set(enrollment.id, enrollment); return enrollment; }
  async listDueEnrollments(beforeIso: string) {
    const before = new Date(beforeIso).getTime();
    return Array.from(this.repo.enrollments.values()).filter((item) => item.state === "active" && new Date(item.nextActionAt).getTime() <= before);
  }

  async createThread(input: Omit<Thread, "id">) { return this.repo.createThread(input); }
  async getThreadById(id: string) { return this.repo.threads.get(id) ?? null; }
  async findThreadByEnrollmentId(enrollmentId: string) { return Array.from(this.repo.threads.values()).find((item) => item.enrollmentId === enrollmentId) ?? null; }
  async listThreadsByAccountId(accountId: string) {
    const inboxIds = new Set((await this.listInboxesByAccountId(accountId)).map((item) => item.id));
    return this.summarizeThreads(Array.from(this.repo.threads.values()).filter((item) => inboxIds.has(item.inboxId)));
  }
  async listThreadsByInboxId(inboxId: string) {
    return this.summarizeThreads(Array.from(this.repo.threads.values()).filter((item) => item.inboxId === inboxId));
  }

  async createMessage(input: Omit<Message, "id">) { return this.repo.createMessage(input); }
  async getMessageById(id: string) { return this.repo.messages.get(id) ?? null; }
  async listMessagesByThreadId(threadId: string) { return Array.from(this.repo.messages.values()).filter((item) => item.threadId === threadId); }
  async listMessagesByAccountId(accountId: string) {
    const threadIds = new Set((await this.listThreadsByAccountId(accountId)).map((item) => item.thread.id));
    return Array.from(this.repo.messages.values()).filter((item) => threadIds.has(item.threadId));
  }
  async updateMessage(message: Message) { this.repo.messages.set(message.id, message); return message; }

  async createSuppression(input: { accountId: string; email: string; reason: string }) {
    return { id: makeId("sup"), ...input };
  }

  async listCampaignsByAccountId(accountId: string) {
    return Array.from(this.repo.campaigns.values()).filter((item) => item.accountId === accountId);
  }

  async listEnrollmentsByCampaignId(campaignId: string) {
    return Array.from(this.repo.enrollments.values()).filter((item) => item.campaignId === campaignId);
  }

  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const enrollments = await this.listEnrollmentsByCampaignId(campaignId);
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

  private async summarizeThreads(threads: Thread[]): Promise<ThreadSummary[]> {
    const summaries = await Promise.all(threads.map(async (thread) => {
      const lead = await this.getLeadById(thread.leadId);
      const inbox = await this.getInboxById(thread.inboxId);
      const enrollment = await this.getEnrollmentById(thread.enrollmentId);
      const campaign = enrollment ? await this.getCampaignById(enrollment.campaignId) : null;
      const messages = (await this.listMessagesByThreadId(thread.id)).sort((a, b) => {
        const left = a.receivedAt ?? a.sentAt ?? "";
        const right = b.receivedAt ?? b.sentAt ?? "";
        return left.localeCompare(right);
      });
      const latestMessage = messages[messages.length - 1] ?? null;
      return {
        thread,
        lead,
        inbox,
        campaign,
        latestMessage,
        messageCount: messages.length,
        unreadCount: messages.filter((message) => message.direction === "inbound").length,
      };
    }));
    return summaries.sort((a, b) => b.thread.lastMessageAt.localeCompare(a.thread.lastMessageAt));
  }
}
