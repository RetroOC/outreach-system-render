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

export type Campaign = {
  id: EntityId;
  accountId: EntityId;
  name: string;
  status: "draft" | "active" | "paused" | "archived";
  objective?: string;
  settings: Record<string, unknown>;
  steps: CampaignStep[];
  scheduleVersion: number;
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
