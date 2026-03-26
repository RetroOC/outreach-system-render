export type SendEmailInput = {
  from: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  threadId?: string;
};

export type SendEmailResult = {
  provider: string;
  providerMessageId: string;
  acceptedAt: string;
};

export type InboundEmailEvent = {
  provider: string;
  threadId: string;
  enrollmentId: string;
  subject: string;
  bodyText: string;
  providerMessageId?: string;
};

export interface EmailProvider {
  readonly name: string;
  send(input: SendEmailInput): Promise<SendEmailResult>;
  normalizeInbound(payload: Record<string, unknown>): Promise<InboundEmailEvent | null>;
}
