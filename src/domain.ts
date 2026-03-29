export type EntityId = string;

export type Account = {
  id: EntityId;
  name: string;
  settings: Record<string, unknown>;
  createdAt: string;
};

export type Inbox = {
  id: EntityId;
  accountId: EntityId;
  emailAddress: string;
  provider: string;
  displayName?: string;
  authStatus: "pending" | "connected" | "expired";
  healthStatus: "healthy" | "degraded" | "paused";
  dailyLimit: number;
  hourlyLimit: number;
  minDelaySeconds: number;
  sendingWindow: Record<string, unknown>;
  sentToday: number;
  reservedToday: number;
  lastSyncAt: string | null;
};

export type Lead = {
  id: EntityId;
  accountId: EntityId;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  title?: string;
  timezone?: string;
  source?: string;
  customFields: Record<string, unknown>;
  tags: string[];
  status: "active" | "suppressed";
};

export type CampaignStep = {
  stepNumber: number;
  type: "email";
  delay: {
    kind: "after_enrollment" | "after_previous_sent";
    amount: number;
    unit: "minutes" | "hours" | "days";
  };
  subjectTemplate: string;
  bodyTemplate: string;
};

export type CampaignSchedule = {
  timezone: string;
  allowedDays: number[];
  startHour: number;
  endHour: number;
};

export type CampaignSettings = {
  trackOpens?: boolean;
  trackClicks?: boolean;
  stopOnReply?: boolean;
  stopOnAutoReply?: boolean;
  dailySendLimit?: number;
  customFields?: string[];
  tags?: string[];
  [key: string]: unknown;
};

export type Campaign = {
  id: EntityId;
  accountId: EntityId;
  name: string;
  status: "draft" | "active" | "paused" | "archived";
  objective?: string;
  settings: CampaignSettings;
  schedule: CampaignSchedule;
  steps: CampaignStep[];
  scheduleVersion: number;
};

export type LeadImport = {
  id: EntityId;
  accountId: EntityId;
  fileName: string;
  status: "uploaded" | "mapped" | "imported";
  headers: string[];
  sampleRows: Record<string, string>[];
  totalRows: number;
  rows: Record<string, string>[];
  mapping: Record<string, string>;
  customFieldKeys: string[];
  tagNames: string[];
  createdLeadIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Enrollment = {
  id: EntityId;
  campaignId: EntityId;
  leadId: EntityId;
  assignedInboxId: EntityId;
  state: "active" | "paused" | "processing" | "completed" | "replied" | "bounced" | "unsubscribed" | "failed";
  currentStepIndex: number;
  nextActionAt: string;
  lastOutboundSentAt: string | null;
  lastInboundReceivedAt: string | null;
  stopReason: string | null;
};

export type Thread = {
  id: EntityId;
  enrollmentId: EntityId;
  leadId: EntityId;
  inboxId: EntityId;
  state: "open" | "replied" | "closed";
  lastMessageAt: string;
};

export type Message = {
  id: EntityId;
  threadId: EntityId;
  enrollmentId: EntityId;
  direction: "inbound" | "outbound";
  subject: string;
  bodyText: string;
  providerMessageId?: string;
  receivedAt?: string;
  sentAt?: string;
  classification?: Record<string, unknown>;
};
