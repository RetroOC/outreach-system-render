import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export type AppConfig = {
  port: number;
  databaseUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
  gmailUser?: string;
  gmailAppPassword?: string;
  defaultEmailProvider?: string;
};

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separatorIndex = line.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    let value = line.slice(separatorIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

export function loadConfig(): AppConfig {
  loadEnvFile();

  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL || undefined,
    apiKey: process.env.API_KEY || undefined,
    webhookSecret: process.env.WEBHOOK_SECRET || undefined,
    gmailUser: process.env.GMAIL_USER || undefined,
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD || undefined,
    defaultEmailProvider: process.env.DEFAULT_EMAIL_PROVIDER || undefined,
  };
}
