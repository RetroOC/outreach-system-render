export type AppConfig = {
  port: number;
  databaseUrl?: string;
  apiKey?: string;
  webhookSecret?: string;
};

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: process.env.DATABASE_URL || undefined,
    apiKey: process.env.API_KEY || undefined,
    webhookSecret: process.env.WEBHOOK_SECRET || undefined,
  };
}
