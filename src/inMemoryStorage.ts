import type { Storage } from "./storage.js";
import type { Account, Campaign, Enrollment, Inbox, Lead, Message, Thread } from "./domain.js";
import { InMemoryRepo } from "./repo.js";

export class InMemoryStorage implements Storage {
  constructor(private readonly repo: InMemoryRepo) {}

  async createAccount(input: Omit<Account, "id" | "createdAt">) { return this.repo.createAccount(input); }
  async getAccountById(id: string) { return this.repo.accounts.get(id) ?? null; }

  async createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">) { return this.repo.createInbox(input); }
  async getInboxById(id: string) { return this.repo.inboxes.get(id) ?? null; }
  async updateInbox(inbox: Inbox) { this.repo.inboxes.set(inbox.id, inbox); return inbox; }

  async createLead(input: Omit<Lead, "id" | "status">) { return this.repo.createLead(input); }
  async getLeadById(id: string) { return this.repo.leads.get(id) ?? null; }

  async createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">) { return this.repo.createCampaign(input); }
  async getCampaignById(id: string) { return this.repo.campaigns.get(id) ?? null; }
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

  async createMessage(input: Omit<Message, "id">) { return this.repo.createMessage(input); }
  async getMessageById(id: string) { return this.repo.messages.get(id) ?? null; }
  async listMessagesByThreadId(threadId: string) { return Array.from(this.repo.messages.values()).filter((item) => item.threadId === threadId); }
  async updateMessage(message: Message) { this.repo.messages.set(message.id, message); return message; }
}
