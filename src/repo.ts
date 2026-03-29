import type { Account, Campaign, Enrollment, Inbox, Lead, LeadImport, Message, Thread } from "./domain.js";

const createId = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export class InMemoryRepo {
  accounts = new Map<string, Account>();
  inboxes = new Map<string, Inbox>();
  leads = new Map<string, Lead>();
  leadImports = new Map<string, LeadImport>();
  campaigns = new Map<string, Campaign>();
  enrollments = new Map<string, Enrollment>();
  threads = new Map<string, Thread>();
  messages = new Map<string, Message>();

  createAccount(input: Omit<Account, "id" | "createdAt">): Account {
    const account: Account = { id: createId("acc"), createdAt: new Date().toISOString(), ...input };
    this.accounts.set(account.id, account);
    return account;
  }

  createInbox(input: Omit<Inbox, "id" | "authStatus" | "healthStatus" | "sentToday" | "reservedToday" | "lastSyncAt">): Inbox {
    const inbox: Inbox = {
      id: createId("inb"),
      authStatus: "pending",
      healthStatus: "healthy",
      sentToday: 0,
      reservedToday: 0,
      lastSyncAt: null,
      ...input,
    };
    this.inboxes.set(inbox.id, inbox);
    return inbox;
  }

  createLead(input: Omit<Lead, "id" | "status">): Lead {
    const lead: Lead = { id: createId("lead"), status: "active", ...input };
    this.leads.set(lead.id, lead);
    return lead;
  }

  createLeadImport(input: Omit<LeadImport, "id" | "createdAt" | "updatedAt">): LeadImport {
    const now = new Date().toISOString();
    const leadImport: LeadImport = { id: createId("imp"), createdAt: now, updatedAt: now, ...input };
    this.leadImports.set(leadImport.id, leadImport);
    return leadImport;
  }

  createCampaign(input: Omit<Campaign, "id" | "scheduleVersion">): Campaign {
    const campaign: Campaign = { id: createId("cmp"), scheduleVersion: 1, ...input };
    this.campaigns.set(campaign.id, campaign);
    return campaign;
  }

  createEnrollment(input: Omit<Enrollment, "id">): Enrollment {
    const enrollment: Enrollment = { id: createId("enr"), ...input };
    this.enrollments.set(enrollment.id, enrollment);
    return enrollment;
  }

  createThread(input: Omit<Thread, "id">): Thread {
    const thread: Thread = { id: createId("thr"), ...input };
    this.threads.set(thread.id, thread);
    return thread;
  }

  createMessage(input: Omit<Message, "id">): Message {
    const message: Message = { id: createId("msg"), ...input };
    this.messages.set(message.id, message);
    return message;
  }
}
