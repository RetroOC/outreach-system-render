import type { EmailProvider, InboundEmailEvent, SendEmailInput, SendEmailResult } from "./types.js";

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock-email";

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    return {
      provider: this.name,
      providerMessageId: `mock_${Math.random().toString(36).slice(2, 10)}`,
      acceptedAt: new Date().toISOString(),
    };
  }

  async normalizeInbound(payload: Record<string, unknown>): Promise<InboundEmailEvent | null> {
    if (!payload.threadId || !payload.enrollmentId || !payload.subject || !payload.bodyText) {
      return null;
    }

    return {
      provider: this.name,
      threadId: String(payload.threadId),
      enrollmentId: String(payload.enrollmentId),
      subject: String(payload.subject),
      bodyText: String(payload.bodyText),
      providerMessageId: typeof payload.providerMessageId === "string" ? payload.providerMessageId : undefined,
    };
  }
}
