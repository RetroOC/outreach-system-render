import type { EmailProvider, InboundEmailEvent, SendEmailInput, SendEmailResult } from "./types.js";

export class GmailProvider implements EmailProvider {
  readonly name = "gmail";

  async send(_input: SendEmailInput): Promise<SendEmailResult> {
    throw new Error("Gmail provider not implemented yet");
  }

  async normalizeInbound(_payload: Record<string, unknown>): Promise<InboundEmailEvent | null> {
    throw new Error("Gmail inbound normalization not implemented yet");
  }
}
