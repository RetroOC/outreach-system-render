import type { EmailProvider } from "./types.js";
import { MockEmailProvider } from "./mockEmailProvider.js";
import { GmailProvider } from "./gmailProvider.js";

export class EmailProviderRegistry {
  private readonly providers = new Map<string, EmailProvider>();

  constructor() {
    const mock = new MockEmailProvider();
    const gmail = new GmailProvider();
    this.providers.set(mock.name, mock);
    this.providers.set(gmail.name, gmail);
  }

  get(name: string): EmailProvider | null {
    return this.providers.get(name) ?? null;
  }

  getDefault(): EmailProvider {
    if (process.env.DEFAULT_EMAIL_PROVIDER) {
      return this.providers.get(process.env.DEFAULT_EMAIL_PROVIDER) ?? this.providers.get("mock-email")!;
    }
    return this.providers.get("mock-email")!;
  }
}
