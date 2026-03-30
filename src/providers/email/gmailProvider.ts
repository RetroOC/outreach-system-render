import nodemailer from "nodemailer";
import type { EmailProvider, InboundEmailEvent, SendEmailInput, SendEmailResult } from "./types.js";

export class GmailProvider implements EmailProvider {
  readonly name = "gmail";

  private getTransport() {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;

    if (!user || !pass) {
      throw new Error("Gmail provider requires GMAIL_USER and GMAIL_APP_PASSWORD");
    }

    return nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }

  async verify(): Promise<void> {
    const transport = this.getTransport();
    await transport.verify();
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const transport = this.getTransport();
    const info = await transport.sendMail({
      from: input.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: input.replyTo,
      headers: input.threadId ? { "X-Outreach-Thread-Id": input.threadId } : undefined,
    });

    return {
      provider: this.name,
      providerMessageId: info.messageId,
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
